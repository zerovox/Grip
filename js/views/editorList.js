define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el : '#editorMenu',
        initialize : function (scenario, debug) {
            this.scenario = scenario;
            this.debug = debug
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorListTemplate, {editors : this.scenario.get("list").toJSON(), hasDebugData : this.scenario.has("activeTask"), debug : this.debug});
            this.$el.html(html);
        }
    });

});