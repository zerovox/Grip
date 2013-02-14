define([
    'backbone',
    'views/EditorList',
    'views/ScenarioList',
    'views/TestList',
    'views/EditorInfo',
    'views/fabric/EditorMap',
    'views/fabric/DebugMap',
    'views/FunctionList',
    'views/TaskList',
    'views/ControlBar',
    'views/DebugBar',
    'views/StackTrace',
    'models/ScenariosModel',
    'libs/text!data/scenarios.json',
    'channels',
    'alertify'
], function (Backbone, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, DebugMap, FunctionList, TaskList, ControlBar, DebugBar, StackTrace, ScenariosModel, ScenariosJSON, channels, alertify) {


    var pfx = ["webkit", "moz", "ms", "o", ""];
    function runPrefixMethod(obj, method) {
        var p = 0, m, t;
        while (p < pfx.length && !obj[m]) {
            m = method;
            if (pfx[p] == "") {
                m = m.substr(0,1).toLowerCase() + m.substr(1);
            }
            m = pfx[p] + m;
            t = typeof obj[m];
            if (t != "undefined") {
                pfx = [pfx[p]];
                return (t == "function" ? obj[m]() : obj[m]);
            }
            p++;
        }
        return false;
    }

    return Backbone.View.extend({
        initialize             : function () {
            //Create our ScenarioCollection from our JSON file describing the scenarios and the list of build in primitives
            this.scenarios = new ScenariosModel(JSON.parse(ScenariosJSON));

            //Create a view for each UI component
            this.scenarioList = new ScenarioList();
            this.editorList = new EditorList();
            this.testList = new TestList();
            this.editorInfo = new EditorInfo();
            this.editorMap = new EditorMap();
            this.functionList = new FunctionList();
            this.taskList = new TaskList();
            this.debugMap = new DebugMap();

            this.controlBar = new ControlBar();
            this.debugBar = new DebugBar();
            this.stackTrace = new StackTrace();

            //Load the initial UI
            this.updateScenario()

            //Don't start in debug mode
            this.disableDebug()

            this.attachChannelListeners()

            var that = this;
            var e = document.getElementById("save");

            //TODO: This doesn't belong here. Also, cancelFullScreen not called on escape button
            //TODO: Fix the offset from onHover events
            e.onclick = function() {
                if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
                    that.editorMap.cancelFullScreen()
                    runPrefixMethod(document, "CancelFullScreen");
                    that.editorMap.render()
                }
                else {
                    that.editorMap.fullScreen()
                    runPrefixMethod(that.editorMap.el.parentElement, "RequestFullScreen");
                    that.editorMap.render()
                }
            }
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
                this.functionList.makeActive(name)
            }, this);

            //Listen for test run command, and run appropriate test
            channels.tests.on("run", function (number) {
                var editor = this.scenarios.get("activeScenario").get("activeEditor");
                var test = editor.get("tests").at(number)
                this.scenarios.get("activeScenario").runTest(test, editor.get("name"), false);
                test.set({passed : true, finished : false})
                this.testList.render()
                this.updateTasks();
                alertify.log("Started test on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
            }, this)

            //Listen for test debug command, and start appropriate test in debug environment
            channels.tests.on("debug", function (number) {
                var editor = this.scenarios.get("activeScenario").get("activeEditor");
                var test = editor.get("tests").at(number)
                this.scenarios.get("activeScenario").runTest(test, editor.get("name"), true)
                test.set({passed : true, finished : false})
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

            //Listen for the step command, then move the active task forward one step
            channels.tasks.on("step", function () {
                this.scenarios.get("activeScenario").get("activeTask").step()
            }, this)
            channels.tasks.on("stepOver", function () {
                //TODO: this.taskList.stepOver();
            }, this)

            //Listen for the add function command, and if we are in editing mode, add the function
            channels.map.on("add", function (func) {
                if (!this.debug){
                    this.editorMap.addFunction(func)
                }
            }, this);

            //Listen for the add input command, and if we are in editing mode, add the input
            channels.map.on("addInput", function (name) {
                if (!this.debug)
                    this.editorMap.addInput(name);
            }, this);

            //Listen for the enable debug mode command, and if we have debug data and we aren't already in debug mode, enter debug mode
            channels.debug.on("enable", function () {
                if (this.scenarios.get("activeScenario").has("activeTask") && !this.debug) {
                    this.enableDebug()
                    this.updateDebug()
                }
            }, this)

            channels.tasks.on("update", function(){
                this.updateDebug()
                this.updateEditor()
            }, this)

        },
        render                 : function () {
            //All the views are self rendering.
        },
        disableDebug           : function () {
            this.debug = false
            this.editorInfo.show()
            this.controlBar.show()
            this.functionList.show()
            this.debugBar.hide()
            this.stackTrace.hide()
            this.editorInfo.show()
            this.editorMap.show()
            this.debugMap.hide()
        },
        enableDebug            : function () {
            this.debug = true
            this.editorInfo.hide()
            this.controlBar.hide()
            this.functionList.hide()
            this.debugBar.show()
            this.stackTrace.show()
            this.editorInfo.hide()
            this.editorMap.hide()
            this.debugMap.show()
            this.updateEditor()
        }, updateEditor        : function () {
            this.updateTests()
            this.editorList.set(this.scenarios.get("activeScenario"), this.debug)
            this.editorInfo.set(this.scenarios.get("activeScenario").get("activeEditor"), this.debug)
            if (this.debug)
                this.debugMap.set(this.scenarios.get("activeScenario").get("activeTask").getActiveMap(), this.scenarios.get("activeScenario").get("functions"), this.scenarios.get("activeScenario").get("list"))
            else
                this.editorMap.set(this.scenarios.get("activeScenario").get("activeEditor").get("map"), this.scenarios.get("activeScenario").get("functions"),this.scenarios.get("activeScenario").get("list"));
            this.functionList.set(this.scenarios.get("activeScenario").get("functions"),this.scenarios.get("activeScenario").get("list"));
        }, updateScenario      : function () {
            this.updateTasks()
            this.updateEditor()
            this.scenarioList.set(this.scenarios)
        }, updateDebug         : function () {
            this.editorList.set(this.scenarios.get("activeScenario"), this.debug)
            this.stackTrace.set(this.scenarios.get("activeScenario").get("activeTask"), this.debug)
        }, updateTasks         : function () {
            this.taskList.set(this.scenarios.get("activeScenario").get("tasks"))
        }, updateTests         : function () {
            this.testList.set(this.scenarios.get("activeScenario").get("activeEditor").get("tests"))
        }

    });

});