define([
    'backbone',
    'views/fabric/DebugMap',
    'views/DebugBar',
    'views/StackTrace',
    'views/Return',
    'models/EditorModel'
], function (Backbone, DebugMap, DebugBar, StackTrace, Return, EditorModel) {

    return Backbone.View.extend({
        initialize        : function (task) {
            this.task = task.task;
            this.debugMap = DebugMap.set(new EditorModel({map : this.task.getActiveMap(), task : this.task}, this.task.get("globalFunctions"), this.task.get("localFunctions")), this.task.get("globalFunctions"), this.task.get("localFunctions"))
            this.debugMap.failMessage(this.task.getFailMessage())
            this.debugBar = new DebugBar(this.task);
            this.stackTrace = new StackTrace(this.task);
            this.return = new Return();

            //Make sure the debug map is visible and correctly positioned
            this.debugMap.show()
            this.listenTo(this.task, "change", _.bind(this.updateDebug, this))
        },
        updateDebug       : function () {
            this.debugMap.set(new EditorModel({map : this.task.getActiveMap(), task : this.task}, this.task.get("globalFunctions"), this.task.get("localFunctions")), this.task.get("globalFunctions"), this.task.get("localFunctions"))
            this.debugMap.failMessage(this.task.getFailMessage())
            this.stackTrace.remove()
            this.stackTrace = new StackTrace(this.task);
        }, removeChildren : function () {
            this.debugBar.remove()
            this.stackTrace.remove()
            this.debugMap.remove()
            this.return.remove()
        }
    });
});