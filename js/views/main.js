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
  'libs/text!json/scenarios.json'
  ], function(Backbone, Mustache, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, ScenariosModelFactory, ScenariosJSON) {

    return Backbone.View.extend({
      initialize : function(){
        this.scenarios = ScenariosModelFactory(JSON.parse(ScenariosJSON));
      },
      render : function(){
        var scenarioList = new ScenarioList(this.scenarios.get("list"));
        scenarioList.render();

        var editorList = new EditorList(this.scenarios.get("active").get("editors").get("list"));
        editorList.render();

        var testList = new TestList(this.scenarios.get("active").get("editors").get("active").get("tests"));
        testList.render();

        var editorInfo = new EditorInfo(this.scenarios.get("active").get("editors").get("active"));
        editorInfo.render();

        var editorMap = new EditorMap(this.scenarios.get("active").get("editors").get("active"), this.scenarios.get("active").get("functions"));
        editorMap.render();

        var functionList = new FunctionList(this.scenarios.get("active").get("functions"));
        functionList.render();
      }


   
  });



  });