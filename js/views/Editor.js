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
            //Create a view for each UI component from top to bottom
            this.editorInfo = new EditorInfo(scen.get("activeEditor"));
            this.editorList = new EditorList(scen)
            this.testList = new TestList({tests : scen.get("activeEditor").get("tests"), scenario : scen})

            //Get the singleton map instance
            this.editorMap = EditorMap.set(scen.get("activeEditor"), scen.get("functions"), scen.get("list"));
            //Make sure map is visible
            this.editorMap.show()

            this.controlBar = new ControlBar({editorMap : this.editorMap});

            this.functionList = new FunctionList(scen.get("functions"), scen.get("list"));
        },
        makeActive   : function (name) {
            this.functionList.makeActive(name)
        }, removeChildren : function(){
            this.editorInfo.remove()
            this.functionList.remove()
            this.controlBar.remove()
            this.editorMap.remove()
            this.editorList.remove()
            this.testList.remove()
        }

    });

});