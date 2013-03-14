define([
    'backbone',
    'channels',
    'mustache',
    'libs/text!templates/debugBar.m'
], function (Backbone, channels, Mustache, DebugBar) {

    return Backbone.View.extend({
        el         : '#debugBar',
        events : {
            "click #step" : "step",
            "click #stepOver" : "stepOver"
        },
        initialize : function(){
          this.render()
        },
        step : function(){
                channels.tasks.trigger("step");
        }, stepOver : function(){
                channels.tasks.trigger("stepOver")
        }, render : function(){
            var html = Mustache.render(DebugBar, {});
            this.$el.html(html);
        }
    });

});