define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'alertify',
    'channels'
], function (Backbone, Mustache, TestListTemplate, alertify, channels) {

    return Backbone.View.extend({
            el             : '#testModal',
            initialize     : function () {
            },
            events         : {
                "click #runAll"      : "runAll",
                "click #addTestCase" : "newTestCase",
                "click .run"         : "run",
                "click .debug"       : "debug",
                "click .recurse"     : "recurse"
            },
            set            : function (testCollection) {
                this.tests = testCollection;
                this.render();
            },
            render         : function () {
                //TODO: Move this logic inside the test model
                var tests = this.tests === undefined ? undefined : this.tests.toJSON()
                var total = 0;
                var passing = 0;

                //TODO: Convert this to a mustache template, render this first
                var inputMap = function(inputs, index){
                    var str = ""
                    _.each(inputs, function(a,b,c){
                        str += b + ' &rarr; <a href="#" class="edit" data-pk="'+index+'" data-type="text" data-name="'+b+'" data-original-title="Enter '+b+'">' + a + "</a><br \\>"
                    })
                    return str
                }

                _.each(tests, function (test, index) {
                    test.index = index;
                    if (test.passed)
                        passing++
                    total++

                    test.inputMap = inputMap(test.inputs, index)
                })

                var html = Mustache.render(TestListTemplate, {tests : tests, total : total, passing : passing, percent : (passing / total) * 100});
                this.$el.html(html);

                var that = this;
                $('.edit').editable({
                    url : function(params){
                        console.log(params)
                        var d = new $.Deferred
                        if(that.tests !== undefined){
                            console.log(that.tests)
                            if(isFinite(parseFloat(params.value)))
                                params.value = parseFloat(params.value)
                            if(params.name === "")
                                that.tests.at(params.pk).set("output", params.value)
                            else
                                that.tests.at(params.pk).get("inputs")[params.name] = params.value
                            d.resolve()
                            that.render()
                            return d.promise()
                        } else {
                            return d.reject('No test found')
                        }
                    }
                });

            }, runAll      : function (e) {
                channels.tests.trigger("runall")
                e.preventDefault()
            }, newTestCase : function () {
                this.tests.newEmptyCase()
                this.render()
            }, run         : function (e) {
                channels.tests.trigger("run", $(e.target).data("index"))
                e.preventDefault()
            }, debug       : function (e) {
                channels.tests.trigger("debug", $(e.target).data("index"))
                e.preventDefault()
            }, recurse     : function (e) {
                channels.tests.trigger("recurse", $(e.target).data("index"))
                e.preventDefault()
            }
        }

    );

});