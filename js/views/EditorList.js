define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el : '#editorMenu',
        initialize : function (scenario) {
            this.scenario = scenario;
            this.render();
        },
        render     : function () {
            var html = Mustache.render(EditorListTemplate, {editors : this.scenario.get("list").toJSON()});
            this.$el.html(html);
        }
    });

});