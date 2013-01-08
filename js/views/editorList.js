define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el         : '#editorMenu',
        initialize : function () {
        },
        set        : function (editorCollection, debug) {
            this.editors && this.editors.off("change:hasDebugData", this.change())
            this.editors = editorCollection;
            this.editors && this.editors.on("change:hasDebugData", this.change())
            this.debug = debug
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorListTemplate, {editors : this.editors.get("list").toJSON(), hasDebugData : this.editors.get("hasDebugData"), debug: this.debug});
            this.$el.html(html);
        },
        change: function(){
            var that = this;
            return function(){that.render()}
        }
    });

});