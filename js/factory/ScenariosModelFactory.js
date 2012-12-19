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
        var slist = new ScenarioCollection()
        var scenarios = new ScenariosModel({list:slist})
        var fs = true
        _.each(scenariosJSON, function (scenario) {
            var elist = new EditorCollection()
            var editors = new EditorsModel({list:elist})
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
                elist.add(e)
                if (es) {
                    editors.set({active:e})
                    e.set({active:true})
                    es = false
                }
            });

            var flist = new FunctionCollection();
            s.set({functions:flist})
            _.each(scenario.functions, function (fname) {
                var f = new FunctionModel();
                f.set({func:primatives[fname]})
                console.log(f);
                flist.add(f);
            });
            if (fs) {
                fs = false
                scenarios.set({active:s})
                s.set({active:true})
            }
            slist.add(s)
        });
        return scenarios;
    }

});