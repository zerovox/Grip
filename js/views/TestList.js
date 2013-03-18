define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'alertify',
    'channels'
], function (Backbone, Mustache, TestListTemplate, alertify, channels) {

    return Backbone.View.extend({
            el             : '#testModal',
            events         : {
                "click #runAll"      : "runAll",
                "click #addTestCase" : "newTestCase",
                "click .run"         : "run",
                "click .debug"       : "debug",
                "click .stop"        : "stop",
                "click .resumedebug" : "resumedebug"
            },
            initialize     : function (m) {
                this.tests = m.tests;
                this.scenario = m.scenario;
                this.tests.on("change", this.render, this)
                this.render();
            },
            render         : function () {
                var total = 0;
                var passing = 0;

                if (typeof this.tests !== "undefined") {
                    var tests = this.tests.reduce(function (memo, test) {
                        var t = {index : total, passed : test.passed(), failMsg : test.getFailMessage(), hadError : test.hadError(), result : test.getLastResult(), running : test.isRunning(), inputMap : "", debug : test.isDebugging()}

                        _.each(test.get("inputs"), function (a, b) {
                            t.inputMap += b + ' &rarr; <a href="#" class="edit" data-pk="' + total + '" data-type="text" data-name="' + b + '" data-original-title="Enter ' + b + '">' + a + "</a><br \\>"
                        })

                        memo.push(t)
                        if (test.passed())
                            passing++
                        total++;
                        return memo
                    }, [])
                }

                var html = Mustache.render(TestListTemplate, {tests : tests, total : total, passing : passing, percent : (passing / total) * 100});
                this.$el.html(html);

                var that = this;
                $('.edit').editable({
                    url : function (params) {
                        var d = new $.Deferred
                        if (that.tests !== undefined) {
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
                channels.debug.trigger("enable")
                this.$el.trigger('reveal:close');
                e.preventDefault()
            }, stop        : function (e) {
                var test = this.tests.at($(e.target).data("index"))
                if (test.isRunning()) {
                    test.kill()
                }
            }, resumedebug       : function (e) {
                var number = $(e.target).data("index")
                var test = this.tests.at(number)
                this.scenario.swapActiveDebug(test)
                channels.debug.trigger("enable")
                this.$el.trigger('reveal:close');
                e.preventDefault()
            }
        }

    );

});