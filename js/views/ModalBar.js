define([
    'backbone',
    'mustache',
    'libs/text!templates/editorModalBar.m'
], function (Backbone, Mustache, ModalBar) {

    return Backbone.View.extend({
        el         : '#modalBar',
        events : {
            "click #testModalButton" : "test",
            "click #taskModalButton" : "task"
        },
        initialize : function(){
            this.render()
        },
        test : function(){
            $("#testModal").reveal()
        }, task : function(){
            $("#taskModal").reveal()
        }, render : function(){
            var html = Mustache.render(ModalBar, {});
            this.$el.html(html);
        }
    });

});