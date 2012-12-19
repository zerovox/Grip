define([
    'backbone',
    'mustache',
    'views/main',
    'channels'
], function (Backbone, Mustache, MainView, channels) {
    var AppRouter = Backbone.Router.extend({
        routes:{
            // Default
            'editor/:name':"switchEditor",
            'scenario/:name':"switchScenario",
            '*actions':'defaultAction'
        }
    });

    var initialize = function () {

        var app_router = new AppRouter;
        var mainView = new MainView();
        mainView.render();

        app_router.on('route:switchEditor', function (name) {
            alert(name);
        });

        app_router.on('route:switchScenario', function (name) {
            channels.scenarios.trigger("switch", name);
        });

        app_router.on('route:defaultAction', function (actions) {
        });

        Backbone.history.start();
    };
    return {
        initialize:initialize
    };
});