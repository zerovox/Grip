define([
    'backbone',
    'mustache',
    'libs/text!templates/editorInfo.m'
], function (Backbone, Mustache, EditorInfo) {

    return Backbone.View.extend({
        el         : '#editorInfo',
        initialize : function (editor, name) {
            this.scenName = name
            this.editor = editor
            this.render()
        },
        render     : function () {
            var json = {scenName : this.scenName};
            if (typeof this.editor !== "undefined") {
                _.extend(json, this.editor.toJSON())
            }
            var html = Mustache.render(EditorInfo, json);
            this.$el.html(html);
        }
    });

});