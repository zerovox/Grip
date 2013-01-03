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
            var tests = this.tests.toJSON()
            _.each(tests, function(test, index){
                test.index = index;
            })
            var html = Mustache.render(TestListTemplate, {tests : tests});
            this.$el.html(html);
        }
    });

});