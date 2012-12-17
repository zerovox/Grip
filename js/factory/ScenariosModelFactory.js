define([
  'backbone',
  'models/ScenariosModel',
  'models/ScenarioModel',
  'models/EditorsModel',
  'models/EditorModel',
  'models/TestModel',
  'collections/scenarios',
  'collections/editors',
  'collections/tests'
  ], function(Backbone, ScenariosModel, ScenarioModel, EditorsModel, EditorModel, TestModel, ScenarioCollection, EditorCollection, TestCollection) {

    return function(scenariosJSON) {
      var slist = new ScenarioCollection()
      var scenarios = new ScenariosModel({list : slist})
      var fs = true
      _.each(scenariosJSON, function(scenario){
        var elist = new EditorCollection()
        var editors = new EditorsModel({list : elist})
        var s = new ScenarioModel({name : scenario.name, editors : editors})
        var es = true
        _.each(scenario.editors, function(editor){
          var tests = new TestCollection()
          var e = new EditorModel({name : editor.name, map : editor.map, info:editor.info, tests : tests})
          _.each(editor.tests, function(test){
            var t = new TestModel(test);
            t.set({status : "Not yet run"});
            tests.add(t);
          })
          elist.add(e)
          if(es){
            editors.set({active:e})
            es = false
          }
        });
        slist.add(s)
        if(fs){
          fs = false
          scenarios.set({active : s})
        }
      });
      return scenarios;
    }




  });