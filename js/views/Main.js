define([
    'backbone',
    'views/ScenarioList',
    'views/Editor',
    'views/Debug',
    'views/ModalBar',
    'models/ScenariosModel',
    'libs/text!data/scenarios.json',
    'channels'
], function (Backbone, ScenarioList, Editor, Debug, ModalBar, ScenariosModel, ScenariosJSON, channels) {

    return Backbone.View.extend({
        initialize   : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = new ScenariosModel(JSON.parse(ScenariosJSON));

            //Create a view for each UI component
            this.scenarioList = new ScenarioList(this.scenarios)
            this.editorView = new Editor(this.scenarios.get("activeScenario"))
            this.modalBar = new ModalBar({scen : this.scenarios.get("activeScenario")})

            //TODO: Clean up this
            this.debugView = {remove : function () {}};
            $("#debugMap").parent().hide()

            this.scenarios.on("change", function(){
                this.scenarioList.remove()
                this.scenarioList = new ScenarioList(this.scenarios)
                this.editorView.remove()
                this.editorView = new Editor(this.scenarios.get("activeScenario"))
                this.modalBar.remove()
                this.modalBar = new ModalBar({scen : this.scenarios.get("activeScenario")})
            }, this)

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                this.scenarios.swap(name, this.scenarios)
            }, this);

            //Listen for editor change events, and switch the active editor accordingly
            channels.editors.on("switch", function (name) {
                this.scenarios.get("activeScenario").swap(name, this.scenarios)
            }, this);

            channels.editors.on("switchFunctionGroup", function (name) {
                this.editorView.makeActive(name)
            }, this);

            channels.editors.on("new", function (name) {
                this.scenarios.get("activeScenario").newEditor(name);
            }, this);
            channels.editors.on("shared", function (jsonstring) {
                this.scenarios.get("activeScenario").newEditorFromJson(JSON.parse(jsonstring));
            }, this);

            //Listen for the enable debug mode command, and if we have debug data enter debug mode
            channels.debug.on("enable", function () {
                if (this.scenarios.get("activeScenario").has("activeTask") && !this.debug) {
                    this.debug = true
                    this.editorView.remove()
                    this.scenarioList.remove()
                    this.modalBar.enableDebug()
                    this.debugView.remove()
                    this.debugView = new Debug({task : this.scenarios.get("activeScenario").get("activeTask")})
                }
            }, this)

            channels.debug.on("disable", function () {
                if (this.debug) {
                    this.debug = false
                    this.debugView.remove()

                    this.editorView.remove()
                    this.editorView = new Editor(this.scenarios.get("activeScenario"))

                    this.scenarioList.remove()
                    this.scenarioList = new ScenarioList(this.scenarios)

                    this.modalBar.disableDebug()
                    if ($("#testModal").reveal)
                        $("#testModal").reveal()
                    else
                        console.log($("#testModal").reveal)

                    this.editorView.remove()
                    this.editorView = new Editor(this.scenarios.get("activeScenario"))
                }
            }, this)

        }

    });

});