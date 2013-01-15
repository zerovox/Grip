define([
    'underscore',
    'backbone',
    'router',
    'views/Main'
], function (_, Backbone, Router, MainView) {
    var initialize = function () {
        _.extend(Backbone.View.prototype, {
            hide : function(){
                this.$el.hide()
            }, show : function(){
                this.$el.show()
            }
        })

        var mainView = new MainView()
        mainView.render()

        Router.initialize();
    };
    return {
        initialize : initialize
    };
});