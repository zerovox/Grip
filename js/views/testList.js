define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.html'
], function (Backbone, Mustache, TestListTemplate) {

    return Backbone.View.extend({
        el         : '.testTableBody',
        initialize : function (testCollection) {
        },
        set        : function (testCollection) {
            this.tests = testCollection;
            this.render();
        },
        render     : function () {
            var html = Mustache.render(TestListTemplate, {tests : this.tests.toJSON()});
            this.$el.html(html);
        }
    });

});