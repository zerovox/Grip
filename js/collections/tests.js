define([
    'backbone',
    'models/TestModel'
], function (Backbone, TestModel) {
    return Backbone.Collection.extend({
        model           : TestModel,
        initialize      : function (a, b, c) {
            this.editor = b
        }, newEmptyCase : function () {
            var fullInputs = this.editor.get("map").inputs;
            var inputs = {}
            _.each(fullInputs, function(o, name){
                inputs[name] = "";
            })
            this.add({inputs : inputs, output : "", finished : false, passed : false})
        }
    });
});