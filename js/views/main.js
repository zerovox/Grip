define([
    'backbone',
    'views/EditorList',
    'views/ScenarioList',
    'views/TestList',
    'views/TaskList',
    'views/Editor',
    'views/Debug',
    'views/ModalBar',
    'models/ScenariosModel',
    'libs/text!data/scenarios.json',
    'channels',
    'alertify'
], function (Backbone, EditorList, ScenarioList, TestList, TaskList, Editor, Debug, ModalBar, ScenariosModel, ScenariosJSON, channels, alertify) {

    return Backbone.View.extend({
        initialize             : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = new ScenariosModel(JSON.parse(ScenariosJSON));

            //Create a view for each UI component
            this.scenarioList = new ScenarioList(this.scenarios)
            this.editorList = new EditorList(this.scenarios.get("activeScenario"), this.debug)
            this.testList = new TestList(this.scenarios.get("activeScenario").get("activeEditor").get("tests"))
            this.taskList = new TaskList(this.scenarios.get("activeScenario").get("tasks"))
            this.editorView = new Editor(this.scenarios.get("activeScenario"))
            this.debugView = {remove : function () {}};
            $("#debugMap").parent().hide()
            this.modalBar = new ModalBar()

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

            //Listen for test run command, and run appropriate test
            channels.tests.on("run", function (number) {
                var editor = this.scenarios.get("activeScenario").get("activeEditor");
                var test = editor.get("tests").at(number)
                this.scenarios.get("activeScenario").runTest(test, editor.get("name"), false);
                test.start()
                this.updateTests()
                this.updateTasks();
                alertify.log("Started test on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
            }, this)

            channels.tests.on("runall", function () {
                var editor = this.scenarios.get("activeScenario").get("activeEditor");
                var that = this
                editor.get("tests").forEach(function (test) {
                    that.scenarios.get("activeScenario").runTest(test, editor.get("name"), false);
                    test.start()
                    that.updateTests()
                    that.updateTasks();
                    alertify.log("Started test on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
                })
            }, this)

            //Listen for test debug command, and start appropriate test in debug environment
            channels.tests.on("debug", function (number) {
                var editor = this.scenarios.get("activeScenario").get("activeEditor");
                var test = editor.get("tests").at(number)
                this.scenarios.get("activeScenario").runTest(test, editor.get("name"), true)
                test.start()
                this.updateTests()
                this.updateTasks()
                this.updateDebug()
                alertify.log("Started debugging on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
                //TODO: instead of marking this test as running, perhaps we should listen to new tasks created, match these against tests, if they match then set the task as running? overkill? do we ever run anyway but through the test interface? if we have two tests of the same inputs, should they both be marked as running when eitehr is run
            }, this)

            channels.tasks.on("succeeded", function (task) {
                this.updateTasks()
                this.updateTests()
            }, this);

            channels.tasks.on("failed", function (task) {
                this.updateTasks()
                this.updateTests()
            }, this);

            //Listen for the add function command, and if we are in editing mode, add the function
            channels.map.on("add", function (func) {
                this.editorView.addFunction(func)
            }, this);

            //Listen for the add input command, and if we are in editing mode, add the input
            channels.map.on("addInput", function (name) {
                this.editorView.addInput(name);
            }, this);

            //Listen for the enable debug mode command, and if we have debug data and we aren't already in debug mode, enter debug mode
            channels.debug.on("enable", function () {
                if (this.scenarios.get("activeScenario").has("activeTask") && !this.debug) {
                    this.enableDebug()
                    this.updateDebug()
                }
            }, this)

            channels.tasks.on("update", function () {
                    this.updateDebug()
                    this.updateEditor()
            }, this)

        },
        render                 : function () {
            //All the views are self rendering.
        },
        disableDebug           : function () {
            if (this.debug) {
                this.debug = false
                this.debugView.remove()

                this.editorView.remove()
                this.editorView = new Editor(this.scenarios.get("activeScenario"))
            }
        },
        enableDebug            : function () {
            if (!this.debug) {
                this.debug = true
                this.debugView.remove()
                this.debugView = new Debug(this.scenarios.get("activeScenario"))

                this.editorView.remove()
            }
        }, updateScenario      : function () {
            this.updateTasks()
            this.updateEditor()

            this.scenarioList.remove()
            this.scenarioList = new ScenarioList(this.scenarios)
        }, updateDebug         : function () {
            if (this.debug) {
                this.debugView.remove()
                this.debugView = new Debug(this.scenarios.get("activeScenario"))
            }
            this.editorList.remove()
            this.editorList = new EditorList(this.scenarios.get("activeScenario"), this.debug)
        }, updateTasks         : function () {
            this.taskList.remove()
            this.taskList = new TaskList(this.scenarios.get("activeScenario").get("tasks"))
        }, updateTests         : function () {
            this.testList.remove()
            this.testList = new TestList(this.scenarios.get("activeScenario").get("activeEditor").get("tests"))
        }, updateEditor        : function () {
            if (!this.debug) {
                this.editorView.remove()
                this.editorView = new Editor(this.scenarios.get("activeScenario"))
            }
            this.updateTests()
            this.editorList.remove()
            this.editorList = new EditorList(this.scenarios.get("activeScenario"), this.debug)
        }

    });

});