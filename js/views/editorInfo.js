define([
    'backbone',
    'mustache',
    'libs/text!templates/editorInfo.m'
], function (Backbone, Mustache, EditorInfo) {

    return Backbone.View.extend({
        el         : '#editorInfo',
        initialize : function () {

        },
        set        : function (editor, debug) {
            this.editor = editor;
            this.debug = debug;
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorInfo, this.editor.toJSON());
            if (this.debug)
                this.$el.html("");
            else
                this.$el.html(html);
        }
    });

});