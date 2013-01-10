define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        complete : function(result){
            this.set("finished", true)

            if(this.get("output") === result){
                this.set("passed", true)
            } else {
                this.set("passed", false)
            }

            this.set("lastResult", result)
        }
    });

});