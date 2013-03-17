define([
    'backbone',
    'views/ScenarioList',
    'views/Editor',
    'views/Debug',
    'views/ModalBar',
    'models/ScenariosModel',
    'libs/text!data/scenarios.json',
    'channels',
    'alertify'
], function (Backbone, ScenarioList, Editor, Debug, ModalBar, ScenariosModel, ScenariosJSON, channels, alertify) {

    return Backbone.View.extend({
        initialize             : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = new ScenariosModel(JSON.parse(ScenariosJSON));

            //Create a view for each UI component
            this.scenarioList = new ScenarioList(this.scenarios)
            this.editorView = new Editor(this.scenarios.get("activeScenario"))
            this.modalBar = new ModalBar()

            //TODO: Clean up this
            this.debugView = {remove : function () {}};
            $("#debugMap").parent().hide()

            this.attachChannelListeners()
        },
        attachChannelListeners : function () {

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                this.disableDebug()
                this.scenarios.swap(name, this.scenarios)
                this.updateScenario();
            }, this);

            //Listen for editor change events, and switch the active editor accordingly
            channels.editors.on("switch", function (name) {
                this.disableDebug()
                this.scenarios.get("activeScenario").swap(name, this.scenarios)
                this.updateEditor();
            }, this);

            channels.editors.on("switchFunctionGroup", function (name) {
                this.editorView.makeActive(name)
            }, this);

            channels.editors.on("new", function (name) {
                this.scenarios.get("activeScenario").newEditor(name);
                this.updateEditor()
            }, this);

            //Listen for the enable debug mode command, and if we have debug data enter debug mode
            channels.debug.on("enable", function () {
                if (this.scenarios.get("activeScenario").has("activeTask")) {
                    this.enableDebug()
                    this.updateDebug()
                } else {
                    //TODO: bit of a hack
                    this.modalBar.editor()
                }
            }, this)
            channels.debug.on("disable", function () {
                    this.disableDebug()
                    this.updateEditor()
            }, this)


            channels.tasks.on("update", function () {
                    this.updateDebug()
                    this.updateEditor()
            }, this)

        },
        disableDebug           : function () {
            if (this.debug) {
                this.debug = false
                this.debugView.remove()

                this.editorView.remove()
                this.editorView = new Editor(this.scenarios.get("activeScenario"))

                this.scenarioList.remove()
                this.scenarioList = new ScenarioList(this.scenarios)
            }
        },
        enableDebug            : function () {
            if (!this.debug) {
                this.debug = true
                this.editorView.remove()
                this.scenarioList.remove()
                this.updateDebug()
            }
        }, updateScenario      : function () {
            this.updateEditor()

            this.scenarioList.remove()
            this.scenarioList = new ScenarioList(this.scenarios)
        }, updateDebug         : function () {
            if (this.debug) {
                this.debugView.remove()
                console.log(this.scenarios.get("activeScenario").get("activeTask"))
                this.debugView = new Debug({task : this.scenarios.get("activeScenario").get("activeTask")})
            }
        }, updateEditor        : function () {
            if (!this.debug) {
                this.editorView.remove()
                this.editorView = new Editor(this.scenarios.get("activeScenario"))
            }
        }

    });

});