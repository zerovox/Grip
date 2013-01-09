define([
    'backbone',
    'models/ScenariosModel',
    'models/ScenarioModel',
    'models/EditorsModel',
    'models/EditorModel',
    'models/TestModel',
    'models/FunctionModel',
    'collections/scenarios',
    'collections/editors',
    'collections/tests',
    'collections/functions'
], function (Backbone, ScenariosModel, ScenarioModel, EditorsModel, EditorModel, TestModel, FunctionModel, ScenarioCollection, EditorCollection, TestCollection, FunctionCollection) {

    return function (scenariosJSON, primatives) {
        var sList = new ScenarioCollection()
        var scenarios = new ScenariosModel({all:sList})
        var fs = true
        _.each(scenariosJSON, function (scenario) {
            //TODO: categories, not all or active
            var eList = new EditorCollection()
            var editors = new EditorsModel({list:eList})
            var s = new ScenarioModel({name:scenario.name, editors:editors})
            var es = true
            _.each(scenario.editors, function (editor) {
                var tests = new TestCollection()
                var e = new EditorModel({name:editor.name, map:editor.map, info:editor.info, tests:tests})
                _.each(editor.tests, function (test) {
                    var t = new TestModel(test);
                    t.set({status:"Not yet run"});
                    tests.add(t);
                })
                eList.add(e)
                if (es) {
                    editors.set({active:e})
                    e.set({active:true})
                    es = false
                }
            });

            var fList = new FunctionCollection();
            s.set({functions:fList})
            _.each(scenario.functions, function (fName) {
                var f = new FunctionModel();
                f.set({func: _.find(primatives, function(prim){return prim.name === fName})})
                fList.add(f);
            });
            if (fs) {
                fs = false
                scenarios.set({active:s})
                s.set({active:true})
            }
            sList.add(s)

            var category = scenario.category
            if(category !== "active" && category !== "all"){
                if(scenarios.has(category)){
                    scenarios.get(category).add(s)
                } else {
                    var c = new ScenarioCollection;
                    c.add(s)
                    scenarios.set(category, c)
                }
            } else {
                console.log("Reserved category")
            }
        });
        return scenarios;
    }

});