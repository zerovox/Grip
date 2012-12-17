define([
  'backbone',
  'mustache',
  'libs/text!templates/scenarioList.html'
], function(Backbone, Mustache, ScenarioListTemplate) {

  return Backbone.View.extend({
    el : '.scenarioMenu',
    initialize : function(scenarioCollection){
      this.scenarios = scenarioCollection;
    },
    render : function(){
      var html = Mustache.render(ScenarioListTemplate, {scenarios : this.scenarios.toJSON()});
      this.$el.html(html);
      //TODO: Highlight active scenario
    }
  });



});