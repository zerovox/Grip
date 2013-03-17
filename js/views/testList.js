define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'alertify'
], function (Backbone, Mustache, TestListTemplate, alertify) {

    return Backbone.View.extend({
            el             : '#testModal',
            events         : {
                "click #runAll"      : "runAll",
                "click #addTestCase" : "newTestCase",
                "click .run"         : "run",
                "click .debug"       : "debug",
                "click .stop"     : "stop"
            },
            initialize     : function (m) {
                this.tests = m.tests;
                this.scenario = m.scenario;
                this.tests.on("change", this.render, this)
                this.render();
            },
            render         : function () {
                //TODO: Move this logic inside the test model
                console.log(this.tests)
                var tests = this.tests === undefined ? undefined : this.tests.toJSON()
                var total = 0;
                var passing = 0;

                //TODO: Convert this to a mustache template, render this first
                var inputMap = function (inputs, index) {
                    var str = ""
                    _.each(inputs, function (a, b, c) {
                        str += b + ' &rarr; <a href="#" class="edit" data-pk="' + index + '" data-type="text" data-name="' + b + '" data-original-title="Enter ' + b + '">' + a + "</a><br \\>"
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
                    url : function (params) {
                        console.log(params)
                        var d = new $.Deferred
                        if (that.tests !== undefined) {
                            console.log(that.tests)
                            if (isFinite(parseFloat(params.value)))
                                params.value = parseFloat(params.value)
                            if (params.name === "")
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
                var editor = this.scenario.get("activeEditor");
                var that = this
                this.tests.forEach(function (test) {
                    that.scenario.runTest(test, editor.get("name"), false);
                    alertify.log("Started test on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
                })
                e.preventDefault()
            }, newTestCase : function () {
                this.tests.newEmptyCase()
                this.render()
            }, run         : function (e) {
                var number = $(e.target).data("index")
                var editor = this.scenario.get("activeEditor");
                var test = this.tests.at(number)
                this.scenario.runTest(test, editor.get("name"), false);
                alertify.log("Started test on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
                e.preventDefault()
            }, debug       : function (e) {
                var number = $(e.target).data("index")
                var editor = this.scenario.get("activeEditor");
                var test = this.tests.at(number)
                this.scenario.runTest(test, editor.get("name"), true)
                alertify.log("Started debugging on " + editor.get("name") + " with inputs " + JSON.stringify(test.get("inputs")))
                e.preventDefault()
            }, stop    : function (e) {
                var test = this.tests.at($(e.target).data("index"))
                //TODO: convert to test
                if (task.isRunning()){
                    task.failed("Task Terminated")
                    this.render()
                    //TODO: Is this needed?
                }
            }
        }

    );

});