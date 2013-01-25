define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({initialize : function (editor) {
        this.set({name : editor.name, map : editor.map, info : editor.info, tests : new TestCollection(editor.tests)})
    }});

});