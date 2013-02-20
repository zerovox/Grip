define([
    'backbone',
    'mustache',
    'libs/text!templates/taskList.m'
], function (Backbone, Mustache, TaskListTemplate) {

    return Backbone.View.extend({
        el         : '#taskModal',
        initialize : function () {
            this.render()
        },
        set        : function (TaskCollection) {
            this.tasks = TaskCollection;
            this.render();
        },
        render     : function () {
            var toRender
            if (this.tasks !== undefined)
                toRender = this.tasks.toJSON()
            var html = Mustache.render(TaskListTemplate, {tasks : toRender, "toJSON" : function () {return JSON.stringify(this);}});
            this.$el.html(html)
            return this
        }

    });

});