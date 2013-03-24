define([
    'backbone',
    'mustache',
    'views/ExportModal',
    'libs/text!templates/extraModal.m',
    'intro'
], function (Backbone, Mustache, ExportModal, ExtraModalTemplate, introJs) {

    return Backbone.View.extend({
            el         : '#extraModal',
            events     : {
                "click #intro"  : "intro",
                "click #export" : "export",
                "click #link" : "linkTo"
            },
            initialize : function (i) {
                this.scen = i.scen;
                this.render();
            },
            render     : function () {
                var html = ExtraModalTemplate;
                this.$el.html(html);
            }, export  : function () {
                if (typeof this.modal !== "undefined")
                    this.modal.remove()
                this.modal = new ExportModal({code : this.scen.toHaskell(false)});
                $("#exportModal").reveal()
            }, intro   : function () {
                this.$el.trigger('reveal:close');
                introJs().start()
            }, linkTo  : function () {
                if (typeof this.modal !== "undefined")
                    this.modal.remove()
                this.modal = new ExportModal({code : 'http://' + window.location.hostname +(window.location.port ? ':'+window.location.port: '') + window.location.pathname + "#/shared/" + JSON.stringify(this.scen.get("activeEditor").toJSON())});
                $("#exportModal").reveal()
            }
        }

    );

});