define([
    'backbone',
    'views/fabric/MapCore'
], function (Backbone, MapCore) {

    return Backbone.View.extend(_.extend(new MapCore(), {
        el                  : "#debugMap",
        maxHeightPercentage : 1,
        onInit              : function (canvas) {
            this.boxes = []
            var that = this;
            var animated = false;
            canvas.on('mouse:down', function (e) {
                if (!animated) {
                    _.each(that.boxes, function (b) {
                        var box = b.box
                        if (e.e.layerX >= (box.left - (box.width / 2)) && e.e.layerX < (box.left + (box.width / 2)) && e.e.layerY >= (box.top - box.height / 2) && e.e.layerY < (box.top + (box.height / 2))) {
                            animated = true;
                            box.bringToFront()
                            box.opacity = 0.7
                            box.animate('width', canvas.getWidth() * 2, {
                                duration : 500
                            });

                            box.animate('height', canvas.getHeight() * 2, {
                                duration   : 500,
                                onChange   : canvas.renderAll.bind(canvas),
                                onComplete : function () {
                                    animated = false;
                                    that.editorModel.get("task").extend(b.func.envEditor)
                                }
                            });

                        }
                    })
                }
            })
        },
        beforeRender        : function () {
            this.boxes = []
        },
        onRender            : function () {
        },
        onWired             : function (inp, out, wire) {
            if (typeof inp.func !== "undefined") {
                var status = inp.func.functionModel.inputs[inp.name]
                if (status.requested) {
                    if (status.responded) {
                        wire.stroke = "rgb(93,164,35)"
                        wire.setShadow({ color : 'rgba(93,164,35,0.9)', offsetX : 0, offsetY : 0, blur : 10});
                        var text = new fabric.Text("" + status.result, {
                            fontSize     : 16,
                            left         : inp.getLeft(),
                            top          : inp.getTop() - 14,
                            lineHeight   : 1,
                            fontFamily   : 'Helvetica',
                            fontWeight   : 'bold',
                            'text-align' : 'right'
                        });
                        this.canvas.add(text);
                        text.left = text.left - (text.width / 2) - 14
                    } else {
                        wire.stroke = "rgb(192,15,19)"
                        wire.setShadow({ color : 'rgba(192,15,19,0.9)', offsetX : 0, offsetY : 0, blur : 10});
                    }
                } else {
                    wire.set({strokeDashArray : [5, 5, 3]})
                }
            } else {
                //We always request the output
                //TODO: Check this doesn't break recursives
                //TODO: We need more information on this, on finish we should show this as a
                wire.stroke = "rgb(192,15,19)"
                wire.setShadow({ color : 'rgba(192,15,19,0.9)', offsetX : 0, offsetY : 0, blur : 10});
            }
        },
        onNewFunction       : function (f, func, box) {
            box.lockMovementX = box.lockMovementY = true;
            box.functionModel = func
            if ("debugString" in func && typeof func.debugString !== "undefined") {
                var text = new fabric.Text(func.debugString, {
                    fontSize   : 14,
                    left       : box.left,
                    top        : box.top + 10 + (box.height / 2),
                    lineHeight : 1,
                    fontFamily : 'Helvetica',
                    fontWeight : 'bold'
                });
                this.canvas.add(text);
            }

            if ("envEditor" in func) {
                this.boxes.push({box : box, func : func})
            }
        }

    }))
});