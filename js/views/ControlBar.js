define([
    'backbone',
    'alertify',
    'channels',
    'mustache',
    'libs/text!templates/controlBar.m'
], function (Backbone, alertify, channels, Mustache, ControlBar) {

    var pfx = ["webkit", "moz", "ms", "o", ""];

    function runPrefixMethod(obj, method) {
        var p = 0, m, t;
        while (p < pfx.length && !obj[m]) {
            m = method;
            if (pfx[p] == "") {
                m = m.substr(0, 1).toLowerCase() + m.substr(1);
            }
            m = pfx[p] + m;
            t = typeof obj[m];
            if (t != "undefined") {
                pfx = [pfx[p]];
                return (t == "function" ? obj[m]() : obj[m]);
            }
            p++;
        }
    }

    return Backbone.View.extend({
        el          : '#controlBar',
        events      : {
            "click #newFunction" : "newFunction",
            "click #addInput"    : "newInput",
            "click #fullscreen"  : "fullscreen"
        },
        initialize  : function (e) {
            this.editorMap = e.editorMap
            this.render()
        },
        fullscreen  : function () {
            if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
                this.editorMap.cancelFullScreen()
                runPrefixMethod(document, "CancelFullScreen");
                this.editorMap.render()
            }
            else {
                this.editorMap.fullScreen()
                runPrefixMethod(this.editorMap.el.parentElement, "RequestFullScreen");
                this.editorMap.render()
            }
        },
        newInput    : function () {
            alertify.prompt("Chose a name for the new input:", _.bind(this, function (e, str) {
                if (e) {
                    this.editorMap.addInput(str);
                }
            }))
        },
        newFunction : function () {
            alertify.prompt("Chose a name for the new function:", function (e, str) {
                if (e) {
                    channels.editors.trigger("new", str);
                }
            });
        }, render   : function () {
            var html = Mustache.render(ControlBar, {});
            this.$el.html(html);
        }
    });

});