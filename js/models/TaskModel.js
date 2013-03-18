define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        step              : function () {
            this.get("worker").postMessage({step : true})
        },
        stepOver          : function () {
            this.get("worker").postMessage({stepOver : true})
        },
        initialize        : function (test, mainMethod, debug, localFunctions, globalFunctions) {
            var that = this;
            var worker = debug ? new Worker('js/workers/debug.js') : new Worker('js/workers/run.js');
            var inputs = test.get("inputs")
            this.set({inputs : inputs, test : test, output : test.get("output"), worker : worker, running : true, name : mainMethod})
            worker.onmessage = function (result) {
                if (result.data.log !== undefined) {
                    console.log(result.data.log)
                } else if (result.data.result !== undefined) {
                    that.finished(result.data.result)
                } else if (result.data.fail !== undefined) {
                    that.fail(result.data.fail)
                } else if (result.data.need !== undefined) {
                    worker.postMessage({input : result.data.need, value : inputs[result.data.need]})
                } else {
                    if (debug)
                        that.update(result.data.debug)
                }
            }
            //reduce is essentially foldl provided by underscore.js
            var locals = localFunctions.reduce(function (memo, value) {
                memo[value.get("name")] = value.get("map")
                return memo
            }, {})
            worker.postMessage({main : mainMethod, localFunctions : locals, inputs : inputs});

            var s = locals[mainMethod]
            s.name = mainMethod
            this.set("stackTrace", [s])
            this.set("globalFunctions", globalFunctions)
            this.set("localFunctions", localFunctions)
            this.set("debug", debug)

        },
        finished          : function (result) {
            this.get("worker").terminate();
            this.set("result", result)
            this.set("running", false)
            this.get("test").complete(result)
            this.set("failed", false)
        },
        fail              : function (failMsg) {
            this.get("worker").terminate();
            this.set("failMsg", failMsg)
            this.set("running", false)
            this.get("test").fail(failMsg)
            this.set("failed", true)
        },
        update            : function (editor) {
            this.set("stackTrace", editor)
            this.set("level", editor.length - 1)
        }, getActiveMap   : function () {
            return this.get("stackTrace")[this.get("level")];
        }, setLevel       : function (level) {
            this.set("level", level)
        }, getStackTrace  : function () {
            return this.get("stackTrace")
        }, getLevel       : function () {
            return this.get("level")
        }, isRunning      : function () {
            return this.get("running")
        }, extend         : function (map) {
            this.set("level", this.get("level") + 1)
            var editor = this.get("stackTrace")
            editor[this.get("level")] = map
            editor.splice(this.get("level") + 1, editor.length - this.get("level") - 1)
        }, getFailMessage : function () {
            return this.get("failMsg")
        }, terminate      : function () {
            this.fail("Task Terminated")
        }, failed         : function () {
            if (this.has("failed"))
                return this.get("failed")
            else return false
        }, getResult      : function () {
            return this.get("result")
        }, isDebugging    : function () {
            return this.get("debug")
        }

    })

});
