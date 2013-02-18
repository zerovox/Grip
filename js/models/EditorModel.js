define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({
        initialize     : function (editor) {
            this.set({tests : new TestCollection(editor.tests)})
            if (editor.map === undefined)
                editor.map = {}
            if (editor.map.functions === undefined)
                editor.map.functions = {}
            if (editor.map.inputs === undefined)
                editor.map.inputs = {}
        },
        addFunction    : function (model) {
            this.get("map").functions[model.name] = model;
        },
        removeFunction : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").functions[name]
        },
        addInput       : function (name) {
            if (name in this.get("map").inputs || name in this.get("map").functions) {
                return false
            } else {
                this.get("map").inputs[name] = {}
                return true
            }
        },
        linkOutput     : function (name) {
            this.get("map").output = name
        },
        linkInput      : function (functionName, functionInput, linkTo) {
            this.get("map").functions[functionName].inputs[functionInput] = {wired : linkTo}
        },
        move           : function (name, x, y) {
            this.get("map").functions[name].x = x
            this.get("map").functions[name].y = y
        }, removeInput : function (name){
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").inputs[name]
        }

    });

});