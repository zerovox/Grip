define([
    'backbone',
    'mustache',
    'libs/text!templates/editorInfo.html'
], function (Backbone, Mustache, EditorInfo) {

    return Backbone.View.extend({
        el         : '.editorInfo',
        initialize : function () {

        },
        set        : function (editor) {
            this.editor = editor;
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorInfo, this.editor.toJSON());
            this.$el.html(html);
            //TODO: Highlight active scenario
        }
    });

});