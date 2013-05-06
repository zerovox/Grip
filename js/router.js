define([
    'backbone'
], function (Backbone) {
    var AppRouter = Backbone.Router.extend({
        routes : {
            'editor/:name'        : "switchEditor",
            'scenario/:name'      : "switchScenario",
            'functionGroup/:name' : "switchGroup",
            'shared/:json'        : "sharedLink",
            '*actions'            : 'defaultAction'
        }
    });

    var initialize = function (main) {

        var app_router = new AppRouter
        app_router.on('route:switchScenario', function (name) {
            main.switchScenario(decodeURIComponent(name))
        })
        app_router.on('route:switchEditor', function (name) {
            main.switchEditor(decodeURIComponent(name))
        })
        app_router.on('route:switchGroup', function (name) {
           main.switchFunctionGroup(decodeURIComponent(name))
        })
        app_router.on('route:sharedLink', function (json) {
            main.sharedLink(decodeURIComponent(json))
        })
        app_router.on('route:defaultAction', function (actions) {
        })

        Backbone.history.start();
    };
    return {
        initialize : initialize
    };
});