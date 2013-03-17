define([
    'backbone',
    'alertify'
], function (Backbone, alertify) {

    return Backbone.Model.extend({
        initialize : function () {
            this.set({running:false, passed:false})
        },
        complete   : function (result) {
            if (this.get("output") === result) {
                this.set("passed", true)
                alertify.success("Test passed!")
            } else {
                this.set("passed", false)
                alertify.error("Test failed!")
            }
            this.set("running", false)
            this.set("lastResult", ""+result)
        },
        fail       : function (failMsg) {
            this.set("passed", false)
            this.set("running", false)
            this.set("lastResult", "Error: " + failMsg)
        },
        start       : function(task){
            this.task = task;
            this.set("running", true)
        }
    });

});