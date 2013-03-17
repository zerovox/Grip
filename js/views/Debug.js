define([
    'backbone',
    'views/fabric/DebugMap',
    'views/DebugBar',
    'views/StackTrace',
    'models/EditorModel'
], function (Backbone, DebugMap, DebugBar, StackTrace, EditorModel) {

    return Backbone.View.extend({
        initialize        : function (scen) {
            this.scenario = scen
            this.debugMap = DebugMap;
            this.debugMap.set(new EditorModel({map : this.scenario.get("activeTask").getActiveMap(), task : this.scenario.get("activeTask")}), this.scenario.get("functions"), this.scenario.get("list"))
            this.scenario.get("activeTask").on("change:level", this.updateDebug, this)

            //TODO: Plug in active task to debug bar, skip the channels
            this.debugBar = new DebugBar(this.scenario.get("activeTask"));
            this.stackTrace = new StackTrace(this.scenario.get("activeTask"));

            //Make sure the debug map is visible and correctly positioned
            this.debugMap.show()
        },
        updateDebug       : function () {
            this.debugMap.set(new EditorModel({map : this.scenario.get("activeTask").getActiveMap(), task : this.scenario.get("activeTask")}), this.scenario.get("functions"), this.scenario.get("list"))
            this.stackTrace.remove()
            this.stackTrace = new StackTrace(this.scenario.get("activeTask"))
        }, removeChildren : function () {
            this.debugBar.remove()
            this.stackTrace.remove()
            this.debugMap.remove()
        }

    });

});