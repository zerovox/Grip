define([
    'backbone',
    'mustache',
    'libs/text!templates/debugBar.m'
], function (Backbone, Mustache, DebugBar) {

    return Backbone.View.extend({
        el          : '#debugBar',
        events      : {
            "click #step"     : "step",
            "click #stepOver" : "stepOver"
        },
        initialize  : function (task) {
            this.task = task
            this.render()
        },
        step        : function () {
            this.task.step()
        }, stepOver : function () {
            this.task.stepOver()
        }, render   : function () {
            var html = Mustache.render(DebugBar, {});
            this.$el.html(html);
        }
    });

});