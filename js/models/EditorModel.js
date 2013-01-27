define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({initialize : function (editor) {
        this.set({tests : new TestCollection(editor.tests)})
    }});

});