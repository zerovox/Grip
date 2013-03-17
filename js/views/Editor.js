define([
    'backbone',
    'views/EditorList',
    'views/ScenarioList',
    'views/TestList',
    'views/EditorInfo',
    'views/fabric/EditorMap',
    'views/FunctionList',
    'views/ControlBar'
], function (Backbone, EditorList, ScenarioList, TestList, EditorInfo, EditorMap, FunctionList, ControlBar) {

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

            this.listenTo(scen, "change", function(){this.update(scen);})
        },
        update : function(scen){
            this.editorInfo.remove()
            this.editorInfo = new EditorInfo(scen.get("activeEditor"));

            this.editorList.remove()
            this.editorList = new EditorList(scen)

            this.testList.remove()
            this.testList = new TestList({tests : scen.get("activeEditor").get("tests"), scenario : scen})

            this.editorMap.set(scen.get("activeEditor"), scen.get("functions"), scen.get("list"));
            this.editorMap.show()

            this.controlBar.remove()
            this.controlBar = new ControlBar({editorMap : this.editorMap});

            this.functionList.remove()
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