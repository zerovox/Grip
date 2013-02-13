define([
    'backbone',
    'fabric',
    'views/fabric/MapCore'
], function (Backbone, fabric, MapCore) {
    return Backbone.View.extend(_.extend(new MapCore(), {
        onInit              : function (canvas) {
            var that = this;
            canvas.on('object:over', function (e) {
                e.target.oldfill = e.target.getFill();

                //If hover over wires or functions, show remove target, in center, on click remove object
                if (e.target.type !== undefined && e.target.type === "wire")
                    e.target.setFill('red');
                else
                    e.target.setFill('#2BA6CB');
                canvas.renderAll();

                //TODO: don't render all, see if we can just render the object and send it to correct height. might not be possible
            });

            canvas.on('object:out', function (e) {
                e.target.setFill(e.target.oldfill);
                delete e.target.oldfill;
                canvas.renderAll();
            });

            var fromOutput = false;
            var fromInput = false;
            var wire = null;
            var source = null;

            var dragging = false;
            var removeFunction = false;

            canvas.on({'mouse:down' : function (e) {
                var target = e.target
                if (target !== undefined && target.type === "functionOutput") {
                    canvas.remove(wire);
                    if (fromInput) {
                        if (target.func !== source.func) {
                            that.wireUp(source.func, target.func, source, target)
                            if (source.type === "output")
                                that.editorMap.output = target.func.functionModel.name
                            else if (target.func.functionModel !== undefined)
                                source.func.functionModel.inputs[source.name] = {wired : target.func.functionModel.name}
                            else
                                source.func.functionModel.inputs[source.name] = {wired : target.func.inputName}
                        }
                    } else {
                        fromOutput = true;
                        wire = new fabric.Line([e.e.layerX, e.e.layerY, e.e.layerX, e.e.layerY], {
                            fill        : '#2BA6CB',
                            strokeWidth : 5,
                            selectable  : false
                        })
                        canvas.add(wire);
                        wire.sendToBack();
                        source = target;
                    }
                    fromInput = false;
                } else if (target !== undefined && (target.type === "input" || target.type === "output")) {
                    canvas.remove(wire);
                    if (fromOutput) {
                        if (target.func !== source.func) {
                            that.wireUp(target.func, source.func, target, source);
                            if (target.type === "output")
                                that.editorMap.output = source.func.functionModel.name
                            else if (source.func.functionModel !== undefined)
                                target.func.functionModel.inputs[target.name] = {wired : source.func.functionModel.name}
                            else
                                target.func.functionModel.inputs[target.name] = {wired : source.func.inputName}
                        }
                    } else {
                        fromInput = true;
                        wire = new fabric.Line([e.e.layerX, e.e.layerY], {
                            fill        : '#2BA6CB',
                            strokeWidth : 5,
                            selectable  : false
                        })
                        canvas.add(wire);
                        wire.sendToBack();
                        source = target;
                    }
                    fromOutput = false;
                } else if (target !== undefined && target.type === "wire") {
                    console.log("remove wire")
                } else if (target !== undefined && target.type === "function") {
                    that.showEdges()
                    dragging = true;
                } else {
                    fromOutput = fromInput = false;
                    canvas.remove(wire);
                }
            }});

            canvas.on({'mouse:up' : function (e) {
                dragging = false;
                that.hideEdges()
                if (removeFunction && e.target !== undefined) {
                    delete that.editorMap.functions[e.target.functionModel.name]
                    if (that.editorMap.output === e.target.functionModel.name) {
                        delete that.editorMap.output
                    }
                    that.render()
                }

                removeFunction = false;
            }})

            canvas.on({'mouse:move' : function (e) {
                if (fromOutput || fromInput) {
                    wire.set({ 'x2' : e.e.layerX, 'y2' : e.e.layerY })
                    canvas.renderAll()
                }
                if (dragging) {
                    if (e.e.layerX < 20 || e.e.layerX > canvas.getWidth() - 20 || e.e.layerY < 20 || e.e.layerY > canvas.getHeight() - 20) {
                        that.edges.setFill(that.edges.selectedFill)
                        removeFunction = true;
                    } else {
                        that.edges.setFill(that.edges.unselectedFill)
                        removeFunction = false;
                    }
                }
            }})
        },
        el                  : "#editorMap",
        maxHeightPercentage : 0.8,
        showEdges           : function () {
            this.canvas.add(this.edges)
            this.edges.setFill(this.edges.unselectedFill)
        }, hideEdges        : function () {
            this.canvas.remove(this.edges)
        }, onResize         : function (h, w) {
            var left = new fabric.Rect({left : 10, top : h / 2, width : 20, height : h});
            var right = new fabric.Rect({left : w - 10, top : h / 2, width : 20, height : h});
            var top = new fabric.Rect({left : w / 2, top : 10, width : w - 40, height : 20})
            var bottom = new fabric.Rect({left : w / 2, top : h - 10, width : w - 40, height : 20})
            this.edges = new fabric.Group([left, right, top, bottom])
            this.edges.selectable = false
            this.edges.unselectedFill = "rgba(198, 15, 19, .2)"
            this.edges.selectedFill = "rgba(198, 15, 19, .9)"
            this.edges.setFill(this.edges.unselectedFill)
        }, onWired          : function (func, func2, wire) {
        }, onNewFunction    : function (funcModel, funcImpl, box) {
            function updateModel(box) {
                box.functionModel.x = box.getLeft()
                box.functionModel.y = box.getTop()
            }

            box.functionModel = funcImpl;

            box.on('moving', function () {
                updateModel(box)
            })

        }, addFunction      : function (func) {
            var funcModel = {function : func.name, y : 50, x : 100, name : this.createGUID(), inputs : {}, arg : func.arg};
            this.newFunction(func, funcModel)
            this.editorMap.functions[funcModel.name] = funcModel;
            this.canvas.renderAll()
        },
        addInput            : function (name) {
            if (this.editorMap.inputs[name] !== undefined || this.editorMap.functions[name] !== undefined) {
                alertify.error("Input with name " + name + " already exists")
            } else {
                this.editorMap.inputs[name] = {};
                this.render();
                //TODO: avoid rendering everything, see if we can just re-render inputs and wires
            }
        }
    }))
});