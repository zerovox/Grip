define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        initialize      : function () {
            this.set({"hasDebugData" : false, "stackTrace" : []});
        },
        swap            : function (to) {
            var matchingEditors = this.get("list").where({name : to});
            if (_.size(matchingEditors) === 1) {
                var match = _.first(matchingEditors)
                if (match !== this.get("activeEditor")) {
                    match.set({activeEditor : true})
                    this.get("activeEditor").set({activeEditor : false});
                    this.set({activeEditor : match});
                    return true;
                }
            } else {
                console.log("No matching editor, or duplicate scenario names", matchingEditors);
            }
            return false;
        }, debugUpdate  : function (map) {
            _.last(this.get("stackTrace")).map = map;
        }, debugStepIn  : function (map) {
            this.get("stackTrace").push({map : map});
        }, debugStepOut : function (map) {
            var old = this.get("stackTrace").pop()
            _.last(this.get("stackTrace")).map = map;
            if (old.active)
                _.last(this.get("stackTrace")).active = true;
        }});

});