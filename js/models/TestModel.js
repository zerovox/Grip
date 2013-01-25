define([
    'backbone',
    'alertify'
], function (Backbone, alertify) {

    return Backbone.Model.extend({
        initialize : function () {
            this.set({finished:false, passed:false})
        },
        complete   : function (result) {
            this.set("finished", true)

            if (this.get("output") === result) {
                this.set("passed", true)
                alertify.success("Test passed!")
            } else {
                this.set("passed", false)
                alertify.error("Test failed!")
            }

            this.set("lastResult", result)
        },
        fail       : function (failMsg) {
            this.set("finished", true)
            this.set("passed", false)
            this.set("lastResult", "Error: " + failMsg)
        }
    });

});