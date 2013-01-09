define([
    'backbone',
    'mustache',
    'libs/text!templates/taskList.m',
    'channels'
], function (Backbone, Mustache, TaskListTemplate, channels) {

    return Backbone.View.extend({
        el         : '#taskModal',
        initialize : function () {
            this.tasks = []
            this.render()
        },
        step : function(){
            //TODO: test for undefined here
          this.active.worker.postMessage({step : true});
        },
        runTest    : function (test, editor) {
            var that = this;
            var arguments = test.get("inputs")
            var output = test.get("output")
            var worker = new Worker('js/workers/debug.js');
            var task = { name : editor.get("name"), inputs : arguments, output : output, running : true, worker : worker}
            this.tasks.push(task)
            this.active = task;
            worker.onmessage = function (result) {
                if(result.data.log !== undefined){
                    console.log(result.data.log)
                }else if(result.data.result !== undefined){
                    worker.terminate();
                    task.result = result.data.result
                    task.running = false;
                    channels.tasks.trigger("succeeded", task)
                    that.render();
                }else if(result.data.fail !== undefined){
                    worker.terminate();
                    task.running = false;
                    task.failMsg = result.data.fail
                    channels.tasks.trigger("failed", task)
                    that.render();
                }else{
                    //TODO: We need to step in or step out when appropriate, get this info from worker when this is implemented
                    console.log(result.data.debug)
                    channels.debug.trigger("update", result.data.debug);
                }
            }
            worker.postMessage({inputs:arguments, editor:editor.get("map"), debugLevel:0});
            this.render();
        },
        render     : function () {
            //TODO: Rerender on display
            var html = Mustache.render(TaskListTemplate, {tasks : this.tasks, "toJSON": function() {return JSON.stringify(this);}});
            this.$el.html(html);
        }
    });

});