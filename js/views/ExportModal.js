define([
    'backbone',
    'mustache',
    'libs/text!templates/exportModal.m',
], function (Backbone, Mustache, ExportModal) {

    return Backbone.View.extend({
            el             : '#exportModal',
            initialize     : function (code) {
                this.code = code
                this.render();
            },
            render         : function () {
                var html = Mustache.render(ExportModal, this.code);
                this.$el.html(html);
            }
        }

    );

});