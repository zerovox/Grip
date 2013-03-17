require([
    'underscore',
    'backbone',
    'router',
    'views/main',
    'foundation.app'
], function (_, Backbone, Router, MainView, FoundationApp) {
    $.fn.editable.defaults.mode = 'inline';

    _.extend(Backbone.View.prototype, {
        hide      : function () {
            this.$el.hide()
        }, show   : function () {
            this.$el.show()
        }, remove : function () {
            if(this.removeChildren)
                this.removeChildren()
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            return this;
        }
    })

    var mainView = new MainView()
    mainView.render()

    Router.initialize();

});