var require = {
    baseUrl : "js",
    paths   : {
        underscore       : 'libs/lodash.min',
        jquery           : 'libs/jquery.min',
        backbone         : 'libs/backbone.min',
        templates        : '../templates',
        mustache         : "libs/mustache",
        fabric           : "libs/fabric.wrap",
        primitives       : "data/prim.wrap",
        alertify         : "libs/alertify.min",
        foundation       : "libs/foundation.min",
        'foundation.app' : "libs/foundation.app",
        modernizr        : "libs/foundation.modernizr",
        mocha            : "libs/mocha",
        chai             : "libs/chai",
        intro            : "libs/intro.min"
    },
    shim    : {
        'backbone'                          : {
            deps    : ['underscore', 'jquery'],
            exports : 'Backbone'
        },
        'libs/jquery-editable-poshytip.min' : {
            deps : ['jquery']
        },
        'foundation.app'                    : {
            deps : ['modernizr', 'jquery', 'foundation', 'libs/jquery-editable-poshytip.min', 'intro']
        },
        'mocha'                             : {
            exports : 'mocha'
        },
        'intro'                             : {
            exports : 'introJs'
        }
    }};