require([
    'underscore',
    'backbone',
    'router',
    'views/Main',
    'foundation.app',
    'intro',
    'alertify'
], function (_, Backbone, Router, MainView, FoundationApp, introJs, alertify) {
    $.fn.editable.defaults.mode = 'inline';
    alertify.set({ delay: 10000 });

    _.extend(Backbone.View.prototype, {
        hide      : function () {
            this.$el.hide()
        }, show   : function () {
            this.$el.show()
        }, remove : function () {
            if (this.removeChildren)
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
    $("#lessonButton").click(function () {
        $('#introModal').trigger('reveal:close');
        introJs().start()
    })
    $("#sandboxButton").click(function () {
        $('#introModal').trigger('reveal:close');
        //Create a new sandbox
    })
    $("#introModal").reveal();
});