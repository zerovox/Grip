require.config({
    paths:{
        underscore:'libs/lodash.min',
        jquery:'libs/jquery.min',
        backbone:'libs/backbone.min',
        templates:'../templates',
        mustache:"libs/mustache",
        fabric:"libs/fabric.wrap",
        primitives : "data/prim.wrap",
        alertify : "libs/alertify.min"

    },
    shim:{
        'backbone':{
            deps:['underscore', 'jquery'],
            exports:'Backbone'
        }
    }});

require(['app'], function (App) {
    App.initialize();
});