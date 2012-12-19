define([
    'backbone',
    'mustache',
    'views/editorList',
    'views/scenarioList',
    'views/testList',
    'views/EditorInfo',
    'views/EditorMap',
    'views/FunctionList',
    'factory/ScenariosModelFactory',
    'libs/text!data/scenarios.json',
    'data/primitives',
    'channels'
], function (Backbone, Mustache, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, ScenariosModelFactory, ScenariosJSON, primitives, channels) {

    return Backbone.View.extend({
        initialize:function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = ScenariosModelFactory(JSON.parse(ScenariosJSON), primitives);

            //Create a view for each UI component
            this.scenarioList = new ScenarioList(this.scenarios.get("list"));
            this.editorList = new EditorList(this.scenarios.get("active").get("editors").get("list"));
            this.testList = new TestList(this.scenarios.get("active").get("editors").get("active").get("tests"));
            this.editorInfo = new EditorInfo(this.scenarios.get("active").get("editors").get("active"));
            this.editorMap = new EditorMap(this.scenarios.get("active").get("editors").get("active"), this.scenarios.get("active").get("functions"));
            this.functionList = new FunctionList(this.scenarios.get("active").get("functions"));

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                var matchingScenarios = this.scenarios.get("list").where({name:name});
                if (matchingScenarios.length === 1) {
                    matchingScenarios[0].set({active:true})
                    this.scenarios.get("active").set({active:false});
                    this.scenarios.set({active:matchingScenarios[0]});
                    this.scenarioList.render();
                } else {
                    console.log("No matching scenario");
                }
            }, this);

        },
        render:function () {
            //Render all the views
            this.scenarioList.render();
            this.editorList.render();
            this.testList.render();
            this.editorInfo.render();
            this.editorMap.render();
            this.functionList.render();
        }



    });

});