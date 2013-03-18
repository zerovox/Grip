define([
    'backbone',
    'mustache',
    'libs/text!templates/testList.m',
    'channels'
], function (Backbone, Mustache, TestListTemplate, channels) {

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
                        var t = {output : test.get("output"), index : total, passed : test.passed(), failMsg : test.getFailMessage(), hadError : test.hadError(), result : test.getLastResult(), running : test.isRunning(), inputMap : "", debug : test.isDebugging()}

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

                $('.edit').editable({
                    url : _.bind(function (params) {
                        var d = new $.Deferred
                        if (this.tests !== undefined) {
                            if (isFinite(parseFloat(params.value)))
                                params.value = parseFloat(params.value)
                            if (params.name === "")
                                this.tests.at(params.pk).set("output", params.value)
                            else
                                this.tests.at(params.pk).get("inputs")[params.name] = params.value
                            d.resolve()
                            this.render()
                            return d.promise()
                        } else {
                            return d.reject('No test found')
                        }
                    }, this)
                });

            }, runAll      : function (e) {
                var name = this.scenario.get("activeEditor").get("name");
                this.tests.forEach(function (test) {
                    this.scenario.runTest(test, name, false);
                }, this)
                e.preventDefault()
            }, newTestCase : function () {
                this.tests.newEmptyCase()
                this.render()
            }, run         : function (e) {
                var number = $(e.target).data("index")
                this.scenario.runTest(this.tests.at(number), this.scenario.get("activeEditor").get("name"), false);
                e.preventDefault()
            }, debug       : function (e) {
                var number = $(e.target).data("index")
                this.scenario.runTest(this.tests.at(number), this.scenario.get("activeEditor").get("name"), true)
                channels.debug.trigger("enable")
                //TODO: This doesn't belong
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