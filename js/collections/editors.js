define([
    'backbone',
    'models/EditorModel'
], function (Backbone, EditorModel) {
    return Backbone.Collection.extend({
        model:EditorModel,
        initialize:function () {
        }
    });
});