define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'alertify'
], function (Backbone, Mustache, TestListTemplate, alertify) {

    return Backbone.View.extend({
        //TODO: render whole modal, not just table body. more info in there such as progress bars
        el         : '#testTableBody',
        initialize : function () {
            this.bind();
        },
        set        : function (testCollection) {
            this.tests = testCollection;
            this.render();
        },
        render     : function () {
            var tests = this.tests.toJSON()
            _.each(tests, function (test, index) {
                test.index = index;
            })
            var html = Mustache.render(TestListTemplate, {tests : tests});
            this.$el.html(html);

        },
        bind     : function () {
            var that = this;
            $('#addTestCase').on("click", function () {
                alertify.prompt("Please enter the inputs as a comma separated list with strings enclosed by quotation marks.", function (e, inputs) {
                    if (e) {
                        alertify.prompt("Please enter the desired output for this test with strings enclosed by quotation marks.", function (e, output) {
                            if (e) {
                                that.tests.add({inputs:JSON.parse('['+inputs+']'), output:JSON.parse(output), status:"Not yet run"})
                                that.render();

                                //TODO: Handle JSON parse fails with log messages
                            }
                        })
                    }
                })
            });

        }
    });

});