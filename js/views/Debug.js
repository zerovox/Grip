define([
    'backbone',
    'views/fabric/DebugMap',
    'views/DebugBar',
    'views/StackTrace',
    'models/EditorModel'
], function (Backbone, DebugMap, DebugBar, StackTrace, EditorModel) {

    return Backbone.View.extend({
        initialize        : function (task) {
            this.task = task.task;
            this.debugMap = DebugMap.set(new EditorModel({map : this.task.getActiveMap(), task : this.task}), this.task.get("globalFunctions"), this.task.get("localFunctions"))
            this.task.on("change", this.updateDebug, this)

            this.debugBar = new DebugBar(this.task);
            this.stackTrace = new StackTrace(this.task);

            //Make sure the debug map is visible and correctly positioned
            this.debugMap.show()
        },
        updateDebug       : function () {
            this.debugMap.set(new EditorModel({map : this.task.getActiveMap(), task : this.task}), this.task.get("globalFunctions"), this.task.get("localFunctions"))
            this.stackTrace.remove()
            this.stackTrace = new StackTrace(this.task);
        }, removeChildren : function () {
            this.debugBar.remove()
            this.stackTrace.remove()
            this.debugMap.remove()
        }

    });

});