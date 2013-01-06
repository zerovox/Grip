define([
    'backbone',
    'alertify',
    'channels'
], function (Backbone, alertify, channels) {

    return Backbone.View.extend({
        el         : '#controlBar',
        initialize : function () {
            $('#addInput').click(function () {
                alertify.prompt("Chose a name for the new input:", function (e, str) {
                    if (e) {
                        channels.map.trigger("addInput", str);
                    }
                });
            })
        }
    });

});