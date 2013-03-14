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
        initialize      : function (scen) {
            //Get the singleton map instance
            this.editorMap = EditorMap
            //Give the editor the latest map
            this.editorMap.set(scen.get("activeEditor"), scen.get("functions"), scen.get("list"));
            //Make sure it is visible
            this.editorMap.show()

            //Create a view for each UI component
            this.editorInfo = new EditorInfo(scen.get("activeEditor"));
            this.controlBar = new ControlBar({editorMap : this.editorMap});
            this.functionList = new FunctionList(scen.get("functions"), scen.get("list"));
        },
        makeActive   : function (name) {
            this.functionList.makeActive(name)
        }, addFunction  : function (func) {
            this.editorMap.addFunction(func)
        }, addInput     : function (inp) {
            this.editorMap.addInput(inp)
        }, removeChildren : function(){
            this.editorInfo.remove()
            this.functionList.remove()
            this.controlBar.remove()
            this.editorMap.remove()
        }

    });

});