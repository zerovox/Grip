define([
    'backbone',
    'views/EditorList',
    'views/ScenarioList',
    'views/TestList',
    'views/EditorInfo',
    'views/fabric/EditorMap',
    'views/FunctionList',
    'views/TaskList',
    'views/ControlBar'
], function (Backbone, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, TaskList, ControlBar) {

    return Backbone.View.extend({
        initialize      : function () {
            //Create a view for each UI component
            this.editorInfo = new EditorInfo();
            this.editorMap = EditorMap;
            this.functionList = new FunctionList();
            this.controlBar = new ControlBar({editorMap : this.editorMap});

        }, set          : function (scen) {
            this.scenario = scen
            this.updateEditor()
        },
        render          : function () {
            //All the views are self rendering.
        }, updateEditor : function () {
            this.editorInfo.set(this.scenario.get("activeEditor"))
            this.editorMap.set(this.scenario.get("activeEditor"), this.scenario.get("functions"), this.scenario.get("list"));
            this.functionList.set(this.scenario.get("functions"), this.scenario.get("list"));
        }, show         : function () {
            this.editorInfo.show()
            this.editorMap.show()
            this.functionList.show()
        }, hide         : function () {
            this.editorInfo.hide()
            this.editorMap.hide()
            this.functionList.hide()
        }, makeActive   : function (name) {
            this.functionList.makeActive(name)
        }, addFunction  : function (func) {
            this.editorMap.addFunction(func)
        }, addInput     : function (inp) {
            this.editorMap.addInput(inp)
        }

    });

});