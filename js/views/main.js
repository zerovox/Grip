define([
    'backbone',
    'mustache',
    'views/editorList',
    'views/scenarioList',
    'views/testList',
    'views/EditorInfo',
    'views/EditorMap',
    'views/FunctionList',
    'views/TaskList',
    'views/ControlBar',
    'views/DebugBar',
    'views/StackTrace',
    'factory/ScenariosModelFactory',
    'libs/text!data/scenarios.json',
    'primitives',
    'channels'
], function (Backbone, Mustache, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, TaskList, ControlBar, DebugBar, StackTrace, ScenariosModelFactory, ScenariosJSON, primitives, channels) {

    function updateEditor(context) {
        context.editorList.set(context.scenarios.get("active").get("editors"), context.debug)
        context.testList.set(context.scenarios.get("active").get("editors").get("active").get("tests"))
        context.editorInfo.set(context.scenarios.get("active").get("editors").get("active"), context.debug)
        context.editorMap.set(context.scenarios.get("active").get("editors").get("active").get("map"), context.scenarios.get("active").get("functions"), context.debug);
        context.functionList.set(context.scenarios.get("active").get("functions"), context.debug);
    }

    function updateScenario(context) {
        context.scenarioList.set(context.scenarios)
        updateEditor(context)
    }

    function updateDebug(context) {
        context.stackTrace.set(context.scenarios.get("active").get("editors"))
    }

    return Backbone.View.extend({
        initialize                : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = ScenariosModelFactory(JSON.parse(ScenariosJSON), primitives);

            //Create a view for each UI component
            this.scenarioList = new ScenarioList();
            this.editorList = new EditorList();
            this.testList = new TestList();
            this.editorInfo = new EditorInfo();
            this.editorMap = new EditorMap();
            this.functionList = new FunctionList();

            this.taskList = new TaskList();

            this.controlBar = new ControlBar();
            this.debugBar = new DebugBar();
            this.stackTrace = new StackTrace();


            //Load the initial UI
            updateScenario(this)

            //Don't start in debug mode
            this.disableDebug()

            this.attachChannelListeners()
        },
        attachChannelListeners : function () {

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                this.disableDebug()
                this.scenarios.swap(name, this.scenarios)
                updateScenario(this);
            }, this);

            channels.editors.on("switch", function (name) {
                this.disableDebug()
                this.scenarios.get("active").get("editors").swap(name, this.scenarios)
                updateEditor(this);
            }, this);

            channels.tests.on("run", function (number) {
                var editor = this.scenarios.get("active").get("editors").get("active");
                var test = editor.get("tests").at(number)
                var functions = this.scenarios.get("active").get("functions")
                this.taskList.runTest(test, editor, functions);

                //TODO: test.set("status") = "Running". then re-render the test case list
            }, this)

            channels.tests.on("debug", function (number) {
                var editor = this.scenarios.get("active").get("editors").get("active");
                var test = editor.get("tests").at(number)
                var functions = this.scenarios.get("active").get("functions")
                this.taskList.runTest(test, editor, functions);
                this.scenarios.get("active").get("editors").set({"hasDebugData" : true})

                //TODO: test.set("status") = "Running". then re-render the test case list
            }, this)

            channels.tasks.on("step", function () {
                this.taskList.step();
            }, this)

            channels.map.on("add", function (func) {
                if (!this.debug)
                    this.editorMap.addFunction(func)
            }, this);

            channels.map.on("addInput", function (name) {
                if (!this.debug)
                    this.editorMap.addInput(name);
            }, this);

            //TODO: Set hasDebugData true when debug data is passed in.
            //this.scenarios.get("active").get("editors").set({"hasDebugData" : true})

            //TODO: Only update editor if we change to/from debug view
            channels.debug.on("enable", function () {
                if (this.scenarios.get("active").get("editors").get("hasDebugData")) {
                    this.enableDebug()
                    updateEditor(this)
                }
            }, this)

            channels.debug.on("update", function (editorMap) {
                this.scenarios.get("active").get("editors").debugUpdate(editorMap)
                updateDebug(this)
            }, this)

            channels.debug.on("stepIn", function (editorMap) {
                this.scenarios.get("active").get("editors").debugStepIn(editorMap) && updateEditor()
            }, this)

            channels.debug.on("stepOut", function (editorMap) {
                this.scenarios.get("active").get("editors").debugStepOut(editorMap) && updateEditor()
            }, this)

        },
        render                    : function () {
            //All the views are self rendering.
        },
        disableDebug              : function () {
            this.debug = false
            this.controlBar.show()
            this.functionList.show()
            this.debugBar.hide()
            this.stackTrace.hide()
            this.editorMap.editorView()
        },
        enableDebug               : function () {
            this.debug = true
            this.controlBar.hide()
            this.functionList.hide()
            this.debugBar.show()
            this.stackTrace.show()
            this.editorMap.debugView()
        }



    });

});