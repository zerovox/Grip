define([
    'backbone',
    'underscore',
    'mustache',
    'libs/text!templates/stack.m'
], function (Backbone, Underscore, Mustache, StackTraceTemplate) {

    return Backbone.View.extend({
        el         : '#stackTrace',
        set : function(task){
            this.stackTrace = task.getStackTrace()
            this.level = task.getLevel()
            this.render()
        }, render : function(){
            var stack = _.clone(this.stackTrace, true)
            var level = this.level;
            _.each(stack, function(item, index){
                item.index = index
                if(index === level)
                    item.active = true;
            })
            var html = Mustache.render(StackTraceTemplate, {stack : stack});
            this.$el.html(html);
        }
    });

});