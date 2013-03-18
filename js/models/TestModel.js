define([
    'backbone',
    'alertify'
], function (Backbone, alertify) {

    return Backbone.Model.extend({
        complete       : function (result) {
            if (this.get("output") === result) {
                alertify.success("Test passed!")
            } else {
                alertify.error("Test failed!")  &rarr;
            }
        },
        fail       : function (failMsg) {
                alertify.error("Test failed with error : "  +failMsg)
        },
        start          : function (task) {
            if (this.has("task") && this.get("task").isRunning()) {
                this.get("task").terminate()
            }
            this.set("task", task);
            alertify.log("Running test with: " + _.reduce(this.get("inputs"), function(memo, value, key){
                memo += "<br />&emsp;" + key + " &rarr; " + value
                return memo
            }, ""))
            this.listenTo(task, "change", _.bind(this.trigger, this, "change"))
        },
        isRunning      : function () {
            if (this.has("task"))
                return this.get("task").isRunning()
            return false;
        },
        passed         : function () {
            return this.has("task") ? (this.get("output") === this.get("task").get("result")) : false
        },
        hadError       : function () {
            return this.has("task") ? this.get("task").failed() : false;
        },
        getLastResult  : function () {
            return this.has("task") ? this.get("task").getResult() : null;
        },
        getFailMessage : function () {
            return this.has("task") ? this.get("task").getFailMessage() : null;
        },
        isDebugging : function(){
            return this.has("task") ? this.get("task").isDebugging() : false;
        },
        kill : function(){
            if (this.has("task"))
                this.get("task").terminate()
        }
    });

});