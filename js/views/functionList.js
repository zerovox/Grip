define([
    'backbone',
    'mustache'
], function (Backbone, Mustache) {

    return Backbone.View.extend({
        initialize:function (functionsCollection) {
            this.funcs = functionsCollection;
        },
        render:function () {
            var canvas = new fabric.Canvas('functionList', {renderOnAddition:false, selection:false, hoverCursor:'default'});
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
                    padding = 20;
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
                    ctx.beginPath();
                    ctx.arc(this.width / 2 - 1, 0, 10, -Math.PI / 2, Math.PI / 2)
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#fff"
                    ctx.fillText(this.name, 0, 0, 80);
                }

            });
            console.log("created function class");
            this.funcs.forEach(function (func, index) {
                var funcObject = new Function(func.get("func")(), index)
                //Disabling selection prevents canvas.on firing with this function object as a target, so instead we disable controls, borders and movement
                funcObject.hasControls = funcObject.hasBorders = false;
                funcObject.lockMovementY = true;
                funcObject.lockMovementX = true;
                funcObject.f = func;
                canvas.add(funcObject);
            });
            canvas.on({'mouse:down':function (e) {
                if (e.target !== undefined && e.target.f !== undefined) {
                    console.log(e.target.f);
                    //Fire event to add function to main map.
                    //Or pass in the current map, and add it ourselves, then let the view for the map listen to changes and redraw apropriately
                }
            }});

            canvas.renderAll();

            //we want to listen for new functions added to the global function collection passed in above.
            //also functions that get removed
            //redraw on anychange?
        }
    });

});