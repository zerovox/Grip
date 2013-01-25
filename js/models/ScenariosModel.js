define([
    'backbone',
    'models/ScenarioModel',
    'collections/Scenarios'
], function (Backbone, ScenarioModel, ScenarioCollection) {

    return Backbone.Model.extend({
        //Override the constructor, this prevents scenariosJSON being interpreted as a map of objects to create, and let's us add them directly to the collection all
        constructor : function(scenariosJSON){
            Backbone.Model.apply(this);
            this.set("all", new ScenarioCollection(scenariosJSON))
            this.set("activeScenario", this.get("all").first())
            this.get("all").first().set({activeScenario : true})
            this.get("all").forEach(function(element, index, list){
                var category = element.get("category")
                if(category !== "active" && category !== "all"){
                    if(this.has(category)){
                        this.get(category).add(element)
                    } else {
                        var c = new ScenarioCollection()
                        c.add(element)
                        this.set(category, c)
                    }
                } else {
                    console.log("Reserved category")
                }
            }, this)
        },
        swap : function (to, scenariosModel) {
            var matchingScenarios = scenariosModel.get("all").where({name : to});
            if (_.size(matchingScenarios) === 1) {
                //Avoid repeated re-rendering
                var match = _.first(matchingScenarios)
                if (match !== scenariosModel.get("activeScenario")) {
                    match.set({activeScenario : true})
                    this.get("activeScenario").set({activeScenario : false});
                    this.set({activeScenario : match});
                    return true;
                }
            } else {
                console.log("No matching scenario, or duplicate scenario names", matchingScenarios);
            }
            return false;
        }});

});