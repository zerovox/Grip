define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m'
], function (Backbone, Mustache, EditorListTemplate) {

    return Backbone.View.extend({
        el : '#editorMenu',
        initialize : function (scenario) {
            this.scenario = scenario;
            this.listenTo(scenario.get("list"), "change", _.bind(this.render, this))
            this.render();
        },
        render     : function () {
            var json = this.scenario.get("list").reduce(function(memo, editor){
                memo.push({name : editor.get("name"), passed : editor.passesTests(), debug : editor.get("debug"), activeEditor : editor.get("activeEditor")})
                return memo;
            }, [], this)
            var html = Mustache.render(EditorListTemplate, {editors : json});
            this.$el.html(html);
        }
    });

});