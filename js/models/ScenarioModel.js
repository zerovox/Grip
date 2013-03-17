define([
    'backbone',
    'models/TaskModel',
    'collections/Tests',
    'collections/Editors',
    'collections/Functions'
], function (Backbone, TaskModel, TestCollection, EditorCollection, FunctionCollection) {

    return Backbone.Model.extend({
        initialize      : function (scenario) {
            this.set("tasks", new TestCollection())
            this.set({name : scenario.name, list : new EditorCollection(scenario.editors), functions : new FunctionCollection(scenario.functions)})
            this.set("activeEditor", this.get("list").first())
            this.get("list").first().set({activeEditor : true})
        },
        swap            : function (to) {
            var matchingEditors = this.get("list").where({name : to});
            if (_.size(matchingEditors) === 1) {
                var match = _.first(matchingEditors)
                if (match !== this.get("activeEditor")) {
                    match.set({activeEditor : true})
                    this.get("activeEditor").set({activeEditor : false});
                    this.set({activeEditor : match});
                    return true;
                }
            } else {
                console.log("No matching editor, or duplicate scenario names", matchingEditors);
            }
            return false;
        }, runTest      : function (test, mainMethod, debug) {
            //TODO: Why are we passing mainMethod by name not the editor ?
            var localFunctions = this.get("list")
            var globalVariables = this.get("functions")
            var task = new TaskModel(test, mainMethod, debug, localFunctions, globalVariables);
            test.start(task)
            if (!this.has("activeTask") || debug) {
                this.set({activeTask : task})
                return true
            }
            return false

        }, newEditor : function(name){
            var newEditor  = new (this.get("list").model)({name : name})
            this.get("list").add(newEditor)
        }
    });

});