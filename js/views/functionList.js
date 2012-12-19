define([
    'backbone',
    'mustache'
], function (Backbone, Mustache) {

    return Backbone.View.extend({
        initialize:function (functionsCollection) {
            this.funcs = functionsCollection;
        },
        render:function () {
            var canvas = new fabric.Canvas('functionList');
            var resize = function () {
                var h = Math.max(200, ($(window).height() - 200) * 0.1);
                var w = $(window).width() > 800 ? $(window).width() * 10 / 12 - 40 : $(window).width() - 40;
                canvas.setHeight(h);
                canvas.setWidth(w);
            };
            $(window).resize(resize);
            resize();

            var Function = fabric.util.createClass(fabric.Object, {
                initialize:function (func, position) {
                    options = {}
                    this.height = 80;
                    this.width = 160;
                    padding = 10;
                    options.top = this.height / 2 + padding
                    options.left = position * this.width + (this.width / 2) + padding * (position + 1);
                    this.callSuper('initialize', options)
                    this.name = func.name;
                    this.inputs = func.inputs;
                },
                _render:function (ctx) {
                    //ctx :: CanvasRenderingContext2D
                    ctx.textAlight = "center"
                    ctx.strokeStyle = "#999"
                    ctx.fillRect(-80, -40, 160, 80);
                    ctx.strokeRect(-80, -40, 160, 80);
                    ctx.fillStyle = "#fff"
                    ctx.fillText(this.name, 0, 0, 80);
                }

            });
            console.log("created function class");
            var i = 0;
            this.funcs.forEach(function (func) {
                var funcObject = new Function(func.get("func")(), i)
                i++;
                funcObject.f = func;
                canvas.on({'mouse:up':function (e) {
                    if (e.target === rect) {
                        //Fire event to add function to main map.
                        //Or pass in the current map, and add it ourselves, then let the view for the map listen to changes and redraw apropriately
                    }
                }});

                canvas.add(funcObject);
            });

            //we want to listen for new functions added to the global function collection passed in above.
            //also functions that get removed
            //redraw on anychange?
        }
    });

});