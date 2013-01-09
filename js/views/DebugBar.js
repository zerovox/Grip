define([
    'backbone',
    'channels'
], function (Backbone, channels) {

    return Backbone.View.extend({
        el         : '#debugBar',
        initialize : function () {
            $('#step').click(function () {
                channels.tasks.trigger("step");
            })
        }
    });

});