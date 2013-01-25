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
        }, activateTask : function (index) {
            var task = this.get("tasks").at(index)
            if (task !== undefined && task !== this.get("activeTask")) {
                task.set({activeTask : true})
                this.get("activeTask").set({activeTask : false})
                this.set({activeTask : task})
                return true
            }
            return false
        }, runTest      : function (test, mainMethod, debug) {
            var localFunctions = this.get("list")
            var task = new TaskModel(test, mainMethod, debug, localFunctions);
            this.get("tasks").add(task)
            if (!this.has("activeTask")) {
                this.set({activeTask : task})
                task.set({activeTask : true})
                return true
            } else if (debug) {
                task.set({activeTask : true})
                this.get("activeTask").set({activeTask : false})
                this.set({activeTask : task})
                return true
            }
            return false

        }
    });

});