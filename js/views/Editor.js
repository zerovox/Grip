define([
    'backbone',
    'views/ScenarioList',
    'views/EditorList',
    'views/ScenarioList',
    'views/TestList',
    'views/EditorInfo',
    'views/fabric/EditorMap',
    'views/FunctionList',
    'views/Run',
    'views/Tools'
], function (Backbone, ScenarioList, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, Run, Tools) {

    return Backbone.View.extend({
        initialize      : function (scenarios) {
            var scen = scenarios.get("activeScenario")
            //Create a view for each UI component from top to bottom
            this.editorInfo = new EditorInfo(scen.get("activeEditor"));
            this.editorList = new EditorList(scen)
            this.testList = new TestList({tests : scen.get("activeEditor").get("tests"), scenario : scen})

            //Add elements to top bar
            this.scenarioList = new ScenarioList(scenarios)
            this.run = new Run();
            this.tools = new Tools(scen);

            //Get the singleton map instance
            this.editorMap = EditorMap.set(scen.get("activeEditor"), scen.get("functions"), scen.get("list"));
            //Make sure map is visible
            this.editorMap.show()

            this.functionList = new FunctionList(scen.get("functions"), scen.get("list"));

            this.listenTo(scen, "change", _.bind(this.update, this, scen))
        },
        update : function(scen){
            this.editorInfo.remove()
            this.editorInfo = new EditorInfo(scen.get("activeEditor"));

            this.editorList.remove()
            this.editorList = new EditorList(scen)

            this.testList.remove()
            this.testList = new TestList({tests : scen.get("activeEditor").get("tests"), scenario : scen})

            this.editorMap.set(scen.get("activeEditor"), scen.get("functions"), scen.get("list"));
            this.editorMap.show()

            this.functionList.remove()
            this.functionList = new FunctionList(scen.get("functions"), scen.get("list"));
        },
        makeActive   : function (name) {
            this.functionList.makeActive(name)
        }, removeChildren : function(){
            this.editorInfo.remove()
            this.functionList.remove()
            this.editorMap.remove()
            this.editorList.remove()
            this.testList.remove()
            this.run.remove()
            this.scenarioList.remove()
            this.tools.remove()
        }

    });

});