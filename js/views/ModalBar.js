define([
    'backbone',
    'mustache',
    'channels',
    'libs/text!templates/modalBar.m',
    'views/ExtraModal'
], function (Backbone, Mustache, channels, ModalBar, ExtraModal) {

    return Backbone.View.extend({
        el              : '#modalBar',
        events          : {
            "click #testModalButton" : "test",
            "click #editorButton"    : "editor",
            "click #extras"    : "extras"
        },
        initialize      : function (i) {
            this.scen = i.scen;
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
        }, render       : function () {
            var html = Mustache.render(ModalBar, {debug : this.dbg});
            this.$el.html(html);
        }, enableDebug  : function () {
            this.dbg = true
            this.render()
        }, disableDebug : function () {
            this.dbg = false
            this.render()
        }, extras : function(){
            if(typeof this.extraModal !== "undefined")
                this.extraModal.remove()
            this.extraModal = new ExtraModal({scen : this.scen});
            $("#extraModal").reveal()
        }
    });

});