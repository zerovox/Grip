define([
    'backbone',
    'models/TaskModel'
], function (Backbone, TaskModel) {
    return Backbone.Collection.extend({
        model:TaskModel
    });
});