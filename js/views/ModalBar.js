define([
    'backbone',
    'mustache',
    'channels',
    'libs/text!templates/modalBar.m'
], function (Backbone, Mustache, channels, ModalBar) {

    return Backbone.View.extend({
        el         : '#modalBar',
        events     : {
            "click #testModalButton" : "test",
            "click #taskModalButton" : "task",
            "click #editorButton"    : "editor",
            "click #debugButton"     : "debug"
        },
        initialize : function () {
            this.render()
            this.dbg = false;
        },
        debug      : function () {
            this.dbg = true
            channels.debug.trigger("enable")
            this.render()
        }, editor  : function () {
            this.dbg = false
            channels.debug.trigger("disable")
            this.render()
        },
        test       : function () {
            $("#testModal").reveal()
        }, task    : function () {
            $("#taskModal").reveal()
        }, render  : function () {
            var html = Mustache.render(ModalBar, {debug : this.dbg});
            this.$el.html(html);
        }
    });

});