define([
    'backbone',
    'mustache',
    'channels',
    'libs/text!templates/modalBar.m'
], function (Backbone, Mustache, channels, ModalBar) {

    return Backbone.View.extend({
        el              : '#modalBar',
        events          : {
            "click #testModalButton" : "test",
            "click #editorButton"    : "editor"
        },
        initialize      : function () {
            this.render()
            this.dbg = false;
        },
        debug           : function () {
            channels.debug.trigger("enable")
        }, editor       : function () {
            channels.debug.trigger("disable")
        },
        test            : function () {
            if ($("#testModal").reveal)
                $("#testModal").reveal()
            else
                console.log($("#testModal").reveal)
        }, render       : function () {
            var html = Mustache.render(ModalBar, {debug : this.dbg});
            this.$el.html(html);
        }, enableDebug  : function () {
            this.dbg = true
            this.render()
        }, disableDebug : function () {
            this.dbg = false
            this.render()
        }
    });

});