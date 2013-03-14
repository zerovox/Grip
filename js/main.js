require([
    'underscore',
    'backbone',
    'router',
    'views/Main',
    'foundation.app'
], function (_, Backbone, Router, MainView, FoundationApp) {
    $.fn.editable.defaults.mode = 'inline';

    _.extend(Backbone.View.prototype, {
        hide      : function () {
            this.$el.hide()
        }, show   : function () {
            this.$el.show()
        }, remove : function () {
            this.$el.empty();
            this.stopListening();
            return this;
        }
    })

    var mainView = new MainView()
    mainView.render()

    Router.initialize();

});