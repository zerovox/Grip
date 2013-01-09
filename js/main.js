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
            deps:['underscore', 'jquery', 'modernizr','foundation', 'foundation.app'],
            exports:'Backbone'
        }
    }});

require(['app'], function (App) {
    App.initialize();
});