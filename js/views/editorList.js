define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el         : '.editorMenu',
        initialize : function () {
        },
        set        : function (editorCollection, debug) {
            this.editors = editorCollection;
            this.debug = debug
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorListTemplate, {editors : this.editors.get("list").toJSON(), hasDebugData : this.editors.get("hasDebugData"), debug: this.debug});
            this.$el.html(html);
        }
    });

});