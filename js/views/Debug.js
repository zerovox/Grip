define([
    'backbone',
    'views/fabric/DebugMap',
    'views/DebugBar',
    'views/StackTrace',
    'models/EditorModel'
], function (Backbone, DebugMap, DebugBar, StackTrace, EditorModel) {

    return Backbone.View.extend({
        initialize     : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.debugMap = new DebugMap();
            this.debugBar = new DebugBar();
            this.stackTrace = new StackTrace();
            this.debug = true
        },
        set            : function (scen) {
            this.scenario && this.scenario.get("activeTask").off(null, this.updateDebug)
            this.scenario = scen
            this.scenario.get("activeTask").on("change:level", this.updateDebug, this)
            this.updateDebug()
        },
        render         : function () {
            //All the views are self rendering.
        }, updateDebug : function () {
            this.debugMap.set(new EditorModel({map : this.scenario.get("activeTask").getActiveMap(), task : this.scenario.get("activeTask")}), this.scenario.get("functions"), this.scenario.get("list"))
            this.stackTrace.set(this.scenario.get("activeTask"))
        }, show        : function () {
            this.debugBar.show()
            this.debugMap.show()
            this.stackTrace.show()
        }, hide        : function () {
            this.debugBar.hide()
            this.debugMap.hide()
            this.stackTrace.hide()
        }

    });

});