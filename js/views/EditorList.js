define([
    'backbone',
    'mustache',
    'libs/text!templates/editorList.m',
    'alertify'
], function (Backbone, Mustache, EditorListTemplate, alertify) {

    return Backbone.View.extend({
        el : '#editorMenu',
        events : {
          "click #newFunction" : "newFunction"
        },
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
            var html = Mustache.render(EditorListTemplate, {editors : json, sandbox : this.scenario.has("sandbox")});
            this.$el.html(html);
        }, newFunction : function () {
            alertify.prompt("Chose a name for the new function:", _.bind(function (e, str) {
                if (e) {
                    this.scenario.newEditor(str);
                }
            }, this));
        }
    });

});