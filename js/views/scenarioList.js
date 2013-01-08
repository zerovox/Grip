define([
    'backbone',
    'mustache',
    'libs/text!templates/scenarioList.m'
], function (Backbone, Mustache, ScenarioListTemplate) {

    return Backbone.View.extend({
        el         : '#scenarioMenu',
        initialize : function () {
            this.set = function (scenarioCollection) {
                this.scenarios = scenarioCollection;
                this.render();
            }
        },
        render     : function () {
            var html = Mustache.render(ScenarioListTemplate, {scenarios : this.scenarios.toJSON()});
            this.$el.html(html);
            //TODO: Highlight active scenario
        }
    });

});