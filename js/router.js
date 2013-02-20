define([
    'backbone',
    'channels'
], function (Backbone, channels) {
    var AppRouter = Backbone.Router.extend({
        routes : {
            'editor/:name'        : "switchEditor",
            'scenario/:name'      : "switchScenario",
            'debug/'              : "debug",
            'functionGroup/:name' : "switchGroup",
            '*actions'            : 'defaultAction'
        }
    });

    var initialize = function () {

        var app_router = new AppRouter
        app_router.on('route:switchScenario', function (name) {
            channels.scenarios.trigger("switch", name)
        })
        app_router.on('route:switchEditor', function (name) {
            channels.editors.trigger("switch", name)
        })
        app_router.on('route:switchGroup', function (name) {
            channels.editors.trigger("switchFunctionGroup", name)
        })
        app_router.on('route:debug', function (t) {
            channels.debug.trigger("enable")
        })
        app_router.on('route:defaultAction', function (actions) {
        })

        Backbone.history.start();
    };
    return {
        initialize : initialize
    };
});