define([
    'backbone',
    'mustache',
    'libs/text!templates/scenarioList.m',
    'alertify'
], function (Backbone, Mustache, ScenarioListTemplate, alertify) {

    return Backbone.View.extend({
        el         : '#scenarioMenu',
        events : {
            "click #newSandbox" : "newScenario"
        },
        initialize : function (scenarios) {
            this.scenarios = scenarios
            this.render()
        },
        render     : function () {
            var toRender = this.scenarios.toJSON()
            delete toRender.activeScenario
            delete toRender.all
            var sandboxes = {}

            var categoryList = []
            _.each(toRender, function (scenarios, name) {
                if(name === "sandboxes")
                    sandboxes = scenarios.toJSON()
                else
                    categoryList.push({categoryName : name, scenarios : scenarios.toJSON()})
            });
            var html = Mustache.render(ScenarioListTemplate, {categories : categoryList, sandboxes : sandboxes});
            this.$el.html(html);
        },
        newScenario : function(){
            var prompt = _.bind(function (e, str) {
                if (e) {
                    if(!this.scenarios.newSandbox(str))
                        alertify.prompt("Lesson or sandbox with this name already exists, please choose a new name:", prompt)
                }
            }, this)
            alertify.prompt("Chose a name for the new sandbox:", prompt);
        }
    });

});