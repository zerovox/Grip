define([
    'backbone',
    'mustache',
    'views/ExportModal',
    'libs/text!templates/tools.m',
    'intro'
], function (Backbone, Mustache, ExportModal, ExtraModalTemplate, introJs) {

    return Backbone.View.extend({
            el         : '#tools',
            events     : {
                "click #intro"  : "intro",
                "click #export" : "export",
                "click #link"   : "linkTo"
            },
            initialize : function (scen) {
                this.scen = scen;
                this.render();
            },
            render     : function () {
                var html = ExtraModalTemplate;
                this.$el.html(html);
            }, export  : function () {
                if (typeof this.modal !== "undefined")
                    this.modal.remove()
                if (typeof this.scen.get("activeEditor") !== "undefined") {
                    try {
                        var obj = {code : this.scen.toHaskell(false)}
                    } catch (e) {
                        var obj = {code : "Cannot translate to haskell, please ensure functions are acyclic."}
                    }
                    this.modal = new ExportModal(obj);
                    $("#exportModal").reveal()
                }
            }, intro   : function () {
                introJs().start()
            }, linkTo  : function () {
                if (typeof this.modal !== "undefined")
                    this.modal.remove()
                if (typeof this.scen.get("activeEditor") !== "undefined") {
                    this.modal = new ExportModal({code : 'http://' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname + "#/shared/" + JSON.stringify(this.scen.get("activeEditor").toJSON())});
                    $("#exportModal").reveal()
                }
            }
        }

    );

});