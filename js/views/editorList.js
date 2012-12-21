define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.html'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el         : '.editorMenu',
        initialize : function (editorCollection) {
        },
        set        : function (editorCollection) {
            this.editors = editorCollection;
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorListTemplate, {editors : this.editors.toJSON()});
            this.$el.html(html);
        }
    });

});