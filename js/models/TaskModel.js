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
            var worker = debug ? new Worker('js/workers/debug.js') : new Worker('js/workers/run2.js');
            var inputs = test.get("inputs")
            this.set({inputs : inputs, test : test, output : test.get("output"), worker : worker, running : true, name : mainMethod})
            var on = function (result) {
                if (result.data.log !== undefined) {
                    console.log(result.data.log)
                } else if (result.data.result !== undefined) {
                    this.finished(result.data.result)
                } else if (result.data.fail !== undefined) {
                    this.fail(result.data.fail)
                } else {
                    this.update(result.data.debug)
                }
            }
            worker.onmessage = _.bind(on, this)
            var locals = localFunctions.reduce(function (memo, value) {
                var name = value.get("name")
                memo[name] = value.get("map")
                memo[name].name = name
                return memo
            }, {})
            worker.postMessage({main : mainMethod, localFunctions : locals, inputs : inputs});
            this.set({stackTrace : [locals[mainMethod]], globalFunctions : globalFunctions, localFunctions : localFunctions, debug : debug});
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
            console.log(editor)
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
            console.log(map)
            this.trigger("change")
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
