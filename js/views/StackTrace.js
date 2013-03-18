define([
    'backbone',
    'underscore',
    'mustache',
    'libs/text!templates/stack.m'
], function (Backbone, Underscore, Mustache, StackTraceTemplate) {

    return Backbone.View.extend({
        el        : '#stackTrace',
        events    : {
            "click .level" : "setLevel"
        },
        initialize       : function (task) {
            this.task = task
            this.stackTrace = task.getStackTrace()
            this.level = task.getLevel()
            this.render()
        }, render : function () {
            var stack = _.clone(this.stackTrace, true)
            var level = this.level;
            _.each(stack, function (item, index) {
                if(typeof item !== "undefined"){
                item.index = index
                if (index === level)
                    item.active = true;
                } else {
                    item = {}
                }
            })
            var html = Mustache.render(StackTraceTemplate, {stack : stack});
            this.$el.html(html);
        },
        setLevel  : function (e) {
            this.task.setLevel($(e.target).data("index"))
        }

    });

})
;