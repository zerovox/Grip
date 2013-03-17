define([
    'backbone',
    'mustache',
    'libs/text!templates/scenarioList.m'
], function (Backbone, Mustache, ScenarioListTemplate) {

    return Backbone.View.extend({
        el         : '#scenarioMenu',
        initialize : function (scenarioCollection) {
            this.scenarios = scenarioCollection
            this.render()
        },
        render     : function () {
            var toRender = this.scenarios.toJSON()
            delete toRender.activeScenario
            delete toRender.all

            var categoryList = []
            _.each(toRender, function (scenarios, name) {
                categoryList.push({categoryName : name, scenarios : scenarios.toJSON()})
            });
            var html = Mustache.render(ScenarioListTemplate, {categories : categoryList});
            this.$el.html(html);
        }
    });

});