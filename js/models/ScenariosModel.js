define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({swap : function(to, scenariosModel){
        //TODO: this logic doesnt quite fit
        var matchingScenarios = scenariosModel.get("all").where({name : to});
        if (matchingScenarios.length === 1) {
            //Avoid repeated re-rendering
            if (matchingScenarios[0] !== scenariosModel.get("active")) {
                matchingScenarios[0].set({active : true})
                this.get("active").set({active : false});
                this.set({active : matchingScenarios[0]});
                return true;
            }
        } else {
            console.log("No matching scenario, or duplicate scenario names", matchingScenarios);
        }
        return false;
    }});

});