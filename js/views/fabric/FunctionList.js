define([
    'backbone',
    'underscore',
    'fabric',
    'views/fabric/EditorMap',
    'alertify',
    'views/fabric/Function'
], function (Backbone, _, fabric, EditorMap, alertify, Function) {

    return new ( Backbone.View.extend({
        el         : "#functionList",
        initialize : function () {
            this.canvas = new fabric.Canvas(this.el, {renderOnAddition : false, selection : false, hoverCursor : 'default'});
            this.canvas.on({'mouse:down' : function (e) {
                if (e.target !== undefined && e.target.f !== undefined) {
                    var f = e.target.f;
                    if (f.has("func")) {
                        if (f.get("func").arg === true) {
                            alertify.prompt("Choose a value for the constant:", function (b, str) {
                                if (b) {
                                    var func = f.get("func")['new'](str);
                                    EditorMap.addFunction(func);
                                }
                            })
                        } else {
                            EditorMap.addFunction(f.get("func"))
                        }
                    } else {
                        var inputs = []
                        _.each(f.get("map").inputs, function(map, name){
                            inputs.push(name)
                        })
                        EditorMap.addFunction({name : f.get("name"), inputs : inputs})
                    }

                    //Fire event to add function to main map.
                    //Or pass in the current map, and add it ourselves, then let the view for the map listen to changes and redraw apropriately
                }
            }});
            var that = this;
            $(window).resize(function () {that.resize()});
        },
        set        : function (functionsCollection) {
            this.funcs = functionsCollection;
            this.resize();
        },
        resize     : function () {
            var h = Math.max(120, ($(window).height() - 100) * 0.20);
            var w = $(window).width() > 999 ? $(window).width() * 10 / 12 - 30 : $(window).width() - 30;
            this.canvas.setHeight(h);
            this.canvas.setWidth(w);
            this.render()
        },
        render     : function () {
            var canvas = this.canvas;
            canvas.clear();
            if(this.funcs){
            this.funcs.forEach(function (func, index) {
                var inputs;
                var name;
                if (func.has("func")) {
                    inputs = _.size(func.get("func").inputs)
                    name = func.get("func").name;
                } else {
                    name = func.get("name")
                    inputs = _.size(func.get("map").inputs)
                }

                var padding = 10;
                var width = 140
                var height = Math.max(40, 40 * inputs);
                var options = {};
                options.left = index * width + (width / 2) + padding * (index + 1);
                options.top = (height / 2) + padding;
                var funcObject = new Function(name, height, width, options)

                //Disabling selection prevents canvas.on firing with this function object as a target, so instead we disable controls, borders and movement
                funcObject.hasControls = funcObject.hasBorders = false;
                funcObject.lockMovementY = true;
                funcObject.lockMovementX = true;
                funcObject.f = func;
                canvas.add(funcObject);
            });

            canvas.renderAll();
            }

            //we want to listen for new functions added to the global function collection passed in above.
            //also functions that get removed
            //redraw on anychange?
        },
        hide       : function () {
            this.$el.parent().hide();
            this.canvas.clear()
        },
        show       : function () {
            if(this.$el)
                this.$el.parent().show();
            this.resize()
        }, remove : function(){
            this.hide();
        }
    }));

})
;