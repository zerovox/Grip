define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        initialize      : function () {
            this.set({"hasDebugData" : false, "stackTrace" : []});
        },
        swap            : function (to) {
            var matchingEditors = this.get("list").where({name : to});
            if (matchingEditors.length === 1) {
                if (matchingEditors[0] !== this.get("active")) {
                    matchingEditors[0].set({active : true})
                    this.get("active").set({active : false});
                    this.set({active : matchingEditors[0]});
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