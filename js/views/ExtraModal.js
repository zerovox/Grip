define([
    'backbone',
    'mustache',
    'views/ExportModal',
    'libs/text!templates/extraModal.m',
], function (Backbone, Mustache, ExportModal, ExtraModalTemplate) {

    return Backbone.View.extend({
            el             : '#extraModal',
            events         : {
                "click #intro" : "intro",
                "click #export"    : "export"
            },
            initialize     : function (i) {
                this.scen = i.scen;
                this.render();
            },
            render         : function () {
                var html = ExtraModalTemplate;
                this.$el.html(html);
            }, export : function(){
                if(typeof this.modal !== "undefined")
                    this.modal.remove()
                this.modal = new ExportModal({code : this.scen.toHaskell(false)});
                $("#exportModal").reveal()
            }, intro : function(){

            }
        }

    );

});