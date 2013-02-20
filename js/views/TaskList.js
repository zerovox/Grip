define([
    'backbone',
    'mustache',
    'libs/text!templates/taskList.m'
], function (Backbone, Mustache, TaskListTemplate) {

    return Backbone.View.extend({
        el         : '#taskModal',
        events     : {
            "click .stop"  : "stop",
            "click .clear" : "clear",
            "click #clearFinished" : "clearFinished"
        },
        initialize : function () {
            this.render()
        },
        set        : function (TaskCollection) {
            this.tasks = TaskCollection;
            this.render();
        },
        render     : function () {
            var toRender
            if (this.tasks !== undefined) {
                toRender = this.tasks.toJSON()
                _.each(toRender, function (item, index) {
                    item.index = index
                })
            }
            var html = Mustache.render(TaskListTemplate, {tasks : toRender, "toJSON" : function () {return JSON.stringify(this);}});
            this.$el.html(html)
            return this
        }, clear   : function (e) {
            this.stop(e)
            this.tasks.remove(this.tasks.at($(e.target).data("index")))
            this.render()
        }, stop    : function (e) {
            var task = this.tasks.at($(e.target).data("index"))
            if (task.isRunning()){
                task.failed("Task Terminated")
                this.render()
            }
        }, clearFinished : function(){
            this.tasks.forEach(function(task){
                if(!task.isRunning())
                    this.tasks.remove(task)
            }, this)
            this.render()
        }

    });

});