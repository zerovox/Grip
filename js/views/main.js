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
    'factory/ScenariosModelFactory',
    'libs/text!data/scenarios.json',
    'primitives',
    'channels'
], function (Backbone, Mustache, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, TaskList, ControlBar, ScenariosModelFactory, ScenariosJSON, primitives, channels) {

    function updateEditor(context) {
        context.editorList.set(context.scenarios.get("active").get("editors"), this.debug)
        context.testList.set(context.scenarios.get("active").get("editors").get("active").get("tests"), this.debug)
        context.editorInfo.set(context.scenarios.get("active").get("editors").get("active"), this.debug)
        context.editorMap.set(context.scenarios.get("active").get("editors").get("active"), context.scenarios.get("active").get("functions"), this.debug);
        context.functionList.set(context.scenarios.get("active").get("functions"), this.debug);
    }

    function updateScenario(context) {
        context.scenarioList.set(context.scenarios.get("list"))
        updateEditor(context)
    }

    return Backbone.View.extend({
        initialize : function () {
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

            //Don't start in debug mode
            this.debug = false

            //Load the initial UI
            updateScenario(this);

            //Listen for scenario change events, and switch the active scenario accordingly.
            channels.scenarios.on("switch", function (name) {
                this.scenarios.swap(name) && updateScenario(this);
            }, this);

            channels.editors.on("switch", function (name) {
                this.scenarios.get("active").get("editors").swap(name) && updateEditor(this);
            }, this);

            channels.tests.on("run", function (number) {
                var editor = this.scenarios.get("active").get("editors").get("active");
                var test = editor.get("tests").at(number)
                var functions = this.scenarios.get("active").get("functions")
                this.taskList.runTest(test, editor, functions);

                //TODO: test.set("status") = "Running". then re-render the test case list
            }, this)


            //TODO: Only update editor if we change to/from debug view
            channels.debug.on("enable", function(){
                this.debug = true
                updateEditor(this)
            }, this)

            channels.debug.on("disable", function(){
                this.debug = false
                updateEditor(this)
            }, this)

            channels.debug.on("update", function (editorMap) {
                this.scenarios.get("active").get("editors").debugUpdate(editorMap) && updateEditor()
            }, this)

            channels.debug.on("stepIn", function (editorMap) {
                this.scenarios.get("active").get("editors").debugStepIn(editorMap) && updateEditor()
            }, this)

            channels.debug.on("stepOut", function (editorMap) {
                this.scenarios.get("active").get("editors").debugStepOut(editorMap) && updateEditor()
            }, this)

        },
        render     : function () {
            //All the views are self rendering.
        }



    });

});