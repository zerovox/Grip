define([
  'backbone',
  'models/FunctionModel'
], function(Backbone, FunctionModel){
  return Backbone.Collection.extend({
    model: FunctionModel,   
    initialize: function(){}
  });
});