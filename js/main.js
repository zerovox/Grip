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
    alertify.set({ delay : 10000 });

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

    Router.initialize(mainView);
    var FF = !(window.mozInnerScreenX == null);

    $("#lessonButton").click(function () {
        $('#introModal').trigger('reveal:close');
        if (FF) {
            $("#ffModal").reveal();
            $("#ffClose").click(function () {
                $('#ffModal').trigger('reveal:close');
                introJs().start()
            })
        } else {
            introJs().start()
        }
    })
    $("#sandboxButton").click(function () {
        $('#introModal').trigger('reveal:close');
        if (FF) {
            $("#ffModal").reveal();
            $("#ffClose").click(function () {
                $('#ffModal').trigger('reveal:close');
                $('#newSandbox').trigger('click');
            })
        } else {
            $('#newSandbox').trigger('click');
        }
    })
    $("#introModal").reveal(); //TODO: Should we create a view for this
    $("#load").animate({opacity : 0}, 1000, function () {
        $("#load").remove()
    })
});