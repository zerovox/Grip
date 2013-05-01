define([
    'backbone',
    'models/ScenarioModel'
], function (Backbone, ScenarioModel) {
    return Backbone.Collection.extend({
        model      : ScenarioModel
    });
});