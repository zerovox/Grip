define([
    'backbone',
    'channels'
], function (Backbone, channels) {

    return Backbone.Model.extend({
        step : function(){
            this.get("worker").postMessage({step : true})
        },
        initialize    : function (test, mainMethod, debug, localFunctions) {
            var that = this;
            var worker = debug ? new Worker('js/debug.js') : new Worker('js/run.js');
            var inputs = test.get("inputs")
            this.set({inputs : inputs, test : test, output : test.get("output"), worker : worker, running : true, name : mainMethod})
            worker.onmessage = function (result) {
                if(result.data.log !== undefined){
                    console.log(result.data.log)
                }else if(result.data.result !== undefined){
                    that.finished(result.data.result)
                }else if(result.data.fail !== undefined){
                    that.failed(result.data.fail)
                } else if(result.data.need !== undefined){
                    worker.postMessage({input : result.data.need, value : inputs[result.data.need]})
                }else{
                    //TODO: We need to step in or step out when appropriate, get this info from worker when this is implemented
                    if(debug)
                        that.update(result.data.debug)
                }
            }
            //reduce is essentially foldl provided by underscore.js
            var locals = localFunctions.reduce(function(memo, value){
                memo[value.get("name")] = value.get("map")
                return memo
            }, {})
            worker.postMessage({main:mainMethod, localFunctions : locals, inputs : inputs});
            this.activeMap = locals[mainMethod]
        },
        finished : function(result){
            this.get("worker").terminate();
            this.set("result",result)
            this.set("running",false)
            this.get("test").complete(result)
            channels.tasks.trigger("succeeded", this)
        },
        failed : function(failMsg){
            this.get("worker").terminate();
            this.set("failMsg",failMsg)
            this.set("running",false)
            this.get("test").fail(failMsg)
            channels.tasks.trigger("failed", this)
        },
        update : function(editor){
            this.activeMap = editor;
            channels.tasks.trigger("update", this)
        }, getActiveMap : function(){
            return this.activeMap;
        }
    });

});
