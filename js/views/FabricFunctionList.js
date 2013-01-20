define([
    'backbone',
    'fabric',
    'channels',
    'alertify'
], function (Backbone, fabric, channels, alertify) {

    return Backbone.View.extend({
        el         : "#functionList",
        initialize : function () {
            this.canvas = new fabric.Canvas(this.el, {renderOnAddition : false, selection : false, hoverCursor : 'default'});
            this.canvas.on({'mouse:down' : function (e) {
                if (e.target !== undefined && e.target.f !== undefined) {
                    if (e.target.f.get("func").arg === true) {
                        alertify.prompt("Choose a value for the constant:", function (b, str) {
                            if (b) {
                                var func = e.target.f.get("func")['new'](str);
                                channels.map.trigger("add", func);
                            }
                        })
                    } else {
                        channels.map.trigger("add", e.target.f.get("func"))
                    }

                    //Fire event to add function to main map.
                    //Or pass in the current map, and add it ourselves, then let the view for the map listen to changes and redraw apropriately
                }
            }});
            var that = this;
            $(window).resize(function(){that.resize()});
        },
        set        : function (functionsCollection) {
            this.funcs = functionsCollection;
            this.resize();
        },
        resize     : function () {
            var h = Math.max(120, ($(window).height() - 100) * 0.20);
            var w = $(window).width() > 999 ? $(window).width() * 10 / 12 - 40 : $(window).width() - 40;
            this.canvas.setHeight(h);
            this.canvas.setWidth(w);
            this.render()
        },
        render     : function () {
            var canvas = this.canvas;
            canvas.clear();
            var Function = fabric.util.createClass(fabric.Object, {
                initialize : function (func, x, y) {
                    if (typeof(y) === 'undefined') y = 0;
                    options = {}
                    this.height = 80;
                    this.width = 160;
                    padding = 20;
                    options.top = y * this.height + (this.height / 2) + padding * (y + 1);
                    options.left = x * this.width + (this.width / 2) + padding * (x + 1);
                    this.callSuper('initialize', options)
                    this.name = func.name;
                    this.inputs = func.inputs;
                },
                _render    : function (ctx) {
                    //ctx :: CanvasRenderingContext2D
                    ctx.textAlight = "center"
                    ctx.strokeStyle = "#999"
                    ctx.fillRect(-80, -40, 160, 80);
                    ctx.strokeRect(-80, -40, 160, 80);
                    ctx.beginPath();
                    ctx.arc(this.width / 2 - 1, 0, 10, -Math.PI / 2, Math.PI / 2)
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#fff"
                    ctx.fillText(this.name, 0, 0, 80);
                }

            });
            this.funcs.forEach(function (func, index) {
                var funcObject = new Function(func.get("func"), index)
                //Disabling selection prevents canvas.on firing with this function object as a target, so instead we disable controls, borders and movement
                funcObject.hasControls = funcObject.hasBorders = false;
                funcObject.lockMovementY = true;
                funcObject.lockMovementX = true;
                funcObject.f = func;
                canvas.add(funcObject);
            });

            canvas.renderAll();

            //we want to listen for new functions added to the global function collection passed in above.
            //also functions that get removed
            //redraw on anychange?
        },
        hide       : function () {
            this.$el.parent().hide();
        },
        show       : function () {
            this.$el.parent().show();
        }
    });

})
;