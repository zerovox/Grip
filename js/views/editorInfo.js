define([
    'backbone',
    'mustache',
    'libs/text!templates/editorInfo.m'
], function (Backbone, Mustache, EditorInfo) {

    return Backbone.View.extend({
        el         : '#editorInfo',
        initialize : function (editor) {
            this.editor = editor
            this.render()
        },
        render     : function () {
            var html = Mustache.render(EditorInfo, this.editor.toJSON());
            this.$el.html(html);
        }
    });

});