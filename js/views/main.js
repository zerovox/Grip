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

    function updateEditor(context) {
        context.editorList.set(context.scenarios.get("active").get("editors").get("list"))
        context.testList.set(context.scenarios.get("active").get("editors").get("active").get("tests"))
        context.editorInfo.set(context.scenarios.get("active").get("editors").get("active"))
        context.editorMap.set(context.scenarios.get("active").get("editors").get("active"), context.scenarios.get("active").get("functions"));
        context.functionList.set(context.scenarios.get("active").get("functions"));
    }

    function updateScenario(context) {
        context.scenarioList.set(context.scenarios.get("list"))
        updateEditor(context)
    }

    return Backbone.View.extend({
        initialize : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = ScenariosModelFactory(JSON.parse(ScenariosJSON), primitives);

            //Create a view for each UI component
            this.scenarioList = new ScenarioList();
            this.editorList = new EditorList();
            this.testList = new TestList();
            this.editorInfo = new EditorInfo();
            this.editorMap = new EditorMap();
            this.functionList = new FunctionList();

            //Load the initial UI
            updateScenario(this);

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                var matchingScenarios = this.scenarios.get("list").where({name : name});
                if (matchingScenarios.length === 1) {
                    //Avoid repeated re-rendering
                    if (matchingScenarios[0] !== this.scenarios.get("active")) {
                        matchingScenarios[0].set({active : true})
                        this.scenarios.get("active").set({active : false});
                        this.scenarios.set({active : matchingScenarios[0]});
                        updateScenario(this);
                    }
                } else {
                    console.log("No matching scenario, or duplicate scenario names", matchingScenarios);
                }
            }, this);

            channels.editors.on("switch", function (name) {
                var editorsModel = this.scenarios.get("active").get("editors")
                var matchingEditors = editorsModel.get("list").where({name : name});
                if (matchingEditors.length === 1) {
                    //Avoid repeated re-rendering
                    if (matchingEditors[0] !== editorsModel.get("active")) {
                        matchingEditors[0].set({active : true})
                        editorsModel.get("active").set({active : false});
                        editorsModel.set({active : matchingEditors[0]});
                        updateEditor(this);
                    }
                } else {
                    console.log("No matching editor, or duplicate scenario names", matchingEditors);
                }
            }, this);

        },
        render     : function () {
            //All the views are self rendering.
        }



    });

});