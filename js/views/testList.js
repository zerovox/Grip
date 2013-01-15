define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'alertify'
], function (Backbone, Mustache, TestListTemplate, alertify) {

    return Backbone.View.extend({
        el         : '#testModal',
        initialize : function () {
            this.bind()
            this.render()
        },
        set        : function (testCollection) {
            this.tests = testCollection;
            this.render();
        },
        render     : function () {
            //TODO: Move this logic inside the test model
            var tests = this.tests === undefined ? undefined : this.tests.toJSON()
            var total = 0;
            var passing = 0;
            _.each(tests, function (test, index) {
                test.index = index;
               if(test.pass)
                    passing++
                total++
            })
            var html = Mustache.render(TestListTemplate, {tests : tests, total : total, passing : passing, percent : passing/total,  "toJSON": function() {return JSON.stringify(this);}});
            this.$el.html(html);

        },
        bind       : function () {
            var that = this;
            $('#addTestCase').live("click", function () {
                alertify.prompt("Please enter the inputs as a comma separated list with strings enclosed by quotation marks.", function (e, inputs) {
                    if (e) {
                        alertify.prompt("Please enter the desired output for this test with strings enclosed by quotation marks.", function (e, output) {
                            if (e) {
                                that.tests.add({inputs : JSON.parse(inputs), output : JSON.parse(output), finished : false, passed : false})
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