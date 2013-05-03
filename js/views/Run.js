define([
    'backbone',
    'mustache',
    'libs/text!templates/run.m'
], function (Backbone, Mustache, Run) {

    return Backbone.View.extend({
        el              : '#runEntry',
        events          : {
            "click #run" : "test"
        },
        initialize      : function (i) {
            this.render()
        },
        test            : function () {
            var modal = $("#testModal")
            if (modal.reveal)
                modal.reveal()
        }, render       : function () {
            var html = Mustache.render(Run, {});
            this.$el.html(html);
        }
    });

});