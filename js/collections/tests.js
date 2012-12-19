define([
    'backbone',
    'models/TestModel'
], function (Backbone, TestModel) {
    return Backbone.Collection.extend({
        model:TestModel,
        initialize:function () {
        }
    });
});