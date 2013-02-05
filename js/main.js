require.config({
    paths:{
        underscore:'libs/lodash.min',
        jquery:'libs/jquery.min',
        backbone:'libs/backbone.min',
        templates:'../templates',
        mustache:"libs/mustache",
        fabric:"libs/fabric.wrap",
        primitives : "data/prim.wrap",
        alertify : "libs/alertify.min",
        foundation : "libs/foundation.min",
        'foundation.app' : "libs/foundation.app",
        modernizr : "libs/foundation.modernizr"
    },
    shim:{
        'backbone':{
            deps:['underscore', 'jquery'],
            exports:'Backbone'
        },
        'foundation.app' : {
            deps:['modernizr', 'jquery', 'foundation']
        }

    }});

require(['app', 'foundation.app'], function (App) {
    App.initialize();
});