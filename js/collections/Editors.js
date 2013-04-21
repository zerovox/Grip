define([
    'backbone',
    'models/EditorModel'
], function (Backbone, EditorModel) {
    return Backbone.Collection.extend({
        constructor : function (editors, prims) {
            Backbone.Collection.apply(this);
            _.forEach(editors, function (editor) {
                this.add(new EditorModel(editor, prims, this))
            }, this);
        },
        model       : EditorModel
    });
});