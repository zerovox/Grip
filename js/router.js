define([
  'backbone',
  'mustache',
  'views/main'
  ], function(Backbone, Mustache, MainView) {
    var AppRouter = Backbone.Router.extend({
      routes: {
      // Default
      'editor/:name' : "switchEditor",
      'scenario/:name' : "switchScenario",
      '*actions': 'defaultAction'
    }
  });

    var initialize = function(){

      var app_router = new AppRouter;
      var mainView;
      var maybeRender = function(){
        if(mainView === undefined){
           mainView = new MainView();
          mainView.render();
        }
      };

      app_router.on('route:switchEditor', function(name){
        maybeRender();
        alert(name);
      });

      app_router.on('route:switchScenario', function(name){
        maybeRender();
        alert(name);
      });

      app_router.on('route:defaultAction', function (actions) {
        maybeRender();
      });

      Backbone.history.start();
    };
    return {
      initialize: initialize
    };
  });