define([
    'backbone',
    'views/fabric/MapCore',
    'fabric'
], function (Backbone, MapCore, fabric) {

    return new (Backbone.View.extend(_.extend(new MapCore(), {
        el                  : "#debugMap",
        maxHeightPercentage : 1,
        onInit              : function (canvas) {
            this.boxes = []
            var animated = false;
            canvas.on('mouse:down', _.bind(function (e) {
                if (!animated) {
                    _.each(this.boxes, function (b) {
                        var box = b.box
                        if (e.e.layerX >= (box.left - (box.width / 2)) && e.e.layerX < (box.left + (box.width / 2)) && e.e.layerY >= (box.top - box.height / 2) && e.e.layerY < (box.top + (box.height / 2))) {
                            animated = true;
                            canvas.clear()
                            canvas.add(box)
                            box.animate('opacity', 0, {
                                duration : 700,
                                onChange   : canvas.renderAll.bind(canvas),
                                onComplete : _.bind(function () {
                                    animated = false;
                                    this.editorModel.get("task").extend(b.func.envEditor)
                                }, this)
                            });
                            box.animate('width', canvas.getWidth() * 2, {
                                duration : 500
                            });
                            box.animate('top', canvas.getHeight() / 2, {
                                duration : 500
                            });
                            box.animate('left', canvas.getWidth() / 2, {
                                duration : 500
                            });
                            box.animate('height', canvas.getHeight() * 2, {
                                duration   : 500
                            });
                        }
                    }, this)
                }
            }, this))
        },
        beforeRender        : function () {
            this.boxes = []
        },
        onRender            : function (canvas) {
            //canvas.add()
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
                        text.lockMovementX = text.lockMovementY = true;
                        text.left = text.left - (text.width / 2) - 14
                        text.hasControls = text.hasBorders = false;
                        this.canvas.add(text);
                    } else {
                        wire.stroke = "rgb(192,15,19)"
                        wire.setShadow({ color : 'rgba(192,15,19,0.9)', offsetX : 0, offsetY : 0, blur : 10});
                    }
                } else {
                    wire.set({strokeDashArray : [5, 5, 3]})
                }
            } else {
                //TODO: We need more information on this, on finish we should show this as a green line, this info should be passed from worker
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
                text.lockMovementX = text.lockMovementY = true;
                text.hasControls = text.hasBorders = false;
                this.canvas.add(text);
            }

            if ("envEditor" in func) {
                this.boxes.push({box : box, func : func})
                box.shadow = new fabric.Shadow({ color : 'rgba(0,0,0,0.7)', blur : 35});
            }
        }, failMessage      : function (msg) {
            if (typeof msg !== "undefined") {
                var text = new fabric.Text("Error: " + msg, {
                    fontSize     : 16,
                    left         : 2,
                    top          : 8,
                    lineHeight   : 1,
                    fontFamily   : 'Helvetica',
                    fontWeight   : 'bold',
                    'text-align' : 'left'
                });
                text.left = text.left + (text.width / 2)
                text.lockMovementX = text.lockMovementY = true;
                text.hasControls = text.hasBorders = false;
                this.canvas.add(text);
            }
        }, moving           : false

    })));
});