require([
    'underscore',
    'backbone',
    'router',
    'views/Main',
    'foundation.app'
], function (_, Backbone, Router, MainView, FoundationApp) {

    _.extend(Backbone.View.prototype, {
        hide    : function () {
            this.$el.hide()
        }, show : function () {
            this.$el.show()
        }
    })

    var mainView = new MainView()
    mainView.render()

    Router.initialize();
});