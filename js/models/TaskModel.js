define([
    'backbone',
    'channels'
], function (Backbone, channels) {

    return Backbone.Model.extend({
        step : function(){
            this.get("worker").postMessage({step : true})
        },
        initialize    : function (test, editor, debug) {
            var that = this;
            var worker = debug ? new Worker('js/debug.js') : new Worker('js/run.js');
            this.set({inputs : test.get("inputs"), test : test, output : test.get("output"), worker : worker, running : true, name : editor.get("name")})
            worker.onmessage = function (result) {
                if(result.data.log !== undefined){
                    console.log(result.data.log)
                }else if(result.data.result !== undefined){
                    that.finished(result.data.result)
                }else if(result.data.fail !== undefined){
                    that.failed(result.data.fail)
                }else{
                    //TODO: We need to step in or step out when appropriate, get this info from worker when this is implemented
                    that.update(result.data.debug)
                }
            }
            worker.postMessage({inputs:test.get("inputs"), editor:editor.get("map")});
            this.activeMap = editor.get("map")
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