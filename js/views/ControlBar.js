define([
    'backbone',
    'alertify',
    'channels'
], function (Backbone, alertify, channels) {

    return Backbone.View.extend({
        el         : '#controlBar',
        events     : {
            "click #newFunction" : "newFunction",
            "click #addInput" : "newInput"
        },
        initialize : function () {
        },
        newInput   : function () {
            alertify.prompt("Chose a name for the new input:", function (e, str) {
                if (e) {
                    channels.map.trigger("addInput", str);
                }
            })
        },
        newFunction : function () {
            alertify.prompt("Chose a name for the new function:", function (e, str) {
                if (e) {
                    channels.editors.trigger("new", str);
                }
            });
        }
    });

});