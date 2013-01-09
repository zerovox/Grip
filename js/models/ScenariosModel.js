define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
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