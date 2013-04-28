define([
    'backbone',
    'mustache',
    'libs/text!templates/return.m',
    'channels'
], function (Backbone, Mustache, Return, channels) {
    return Backbone.View.extend({
        el              : '#runEntry',
        events          : {
            "click #return" : "ret"
        },
        initialize      : function () {
            this.render()
        },
        ret            : function () {
            channels.debug.trigger("disable")
        }, render       : function () {
            var html = Mustache.render(Return, {});
            this.$el.html(html);
        }
    });
});