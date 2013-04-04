define([
    'backbone',
    'models/TestModel'
], function (Backbone, TestModel) {
    return Backbone.Collection.extend({
        model           : TestModel,
        initialize      : function (items, editor) {
            this.editor = editor
        }, newEmptyCase : function () {
            var fullInputs = this.editor.get("map").inputs;
            var inputs = {}
            _.each(fullInputs, function(o, name){
                inputs[name] = "";
            })
            return this.add(new TestModel({inputs : inputs, output : "", finished : false, passed : false})).last()
        }
    });
});