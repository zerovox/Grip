define([
    'backbone',
    'fabric',
    'views/fabric/MapCore'
], function (Backbone, fabric, MapCore) {
    return new (Backbone.View.extend(_.extend(new MapCore(), {
        onInit              : function (canvas) {


            //TODO: Refactor next two event handlers
            canvas.on('object:over', _.bind(function (e) {
                var target = e.target
                target.oldfill = target.getFill()
                if (target.type !== undefined) {
                    //If hover over wires or functions

                    if (target.type === "wire") {
                        target.oldfill = target.getStroke();
                        //target.setStroke('rgb(77,77,77)');
                    }

                    if (target.type === "input") {
                        target.setFill('rgb(77,77,77)');
                        target.hoverText = new fabric.Text(target.name, {
                            fontSize     : 16,
                            left         : target.getLeft(),
                            top          : target.getTop() - 14,
                            lineHeight   : 1,
                            fontFamily   : 'Helvetica',
                            fontWeight   : 'bold',
                            'text-align' : 'right'
                        });
                        this.canvas.add(target.hoverText);
                        target.hoverText.left = target.hoverText.left - (target.hoverText.width / 2) - 14
                    }

                    if (target.type === "output" || target.type === "functionOutput") {
                        target.setFill('rgb(77,77,77)');
                    }

                    if (target.type === "functionInput") {
                        target.ex.setFill(target.ex.hoverFill)
                    }

                    if (target.type === "ex") {
                        target.setFill(target.fullFill)
                        target.hovered = true
                    }

                    canvas.renderAll();
                }
            }, this));

            canvas.on('object:out', function (e) {
                var target = e.target
                if (target.type !== undefined && target.type === "wire") {
                    target.setStroke(target.oldfill);
                } else {
                    if (target.type !== undefined && target.type === "functionInput" && !target.ex.hovered) {
                        target.ex.setFill(target.ex.noFill)
                    }
                    if (target.hoverText !== undefined) {
                        canvas.remove(target.hoverText)
                        delete target.hoverText
                    }
                    if (target.type !== undefined && target.type === "ex") {
                        target.hovered = false
                    }
                    target.setFill(target.oldfill);
                }
                delete target.oldfill;
                canvas.renderAll();
            });

            var fromOutput = false;
            var fromInput = false;
            var wire = null;
            var source = null;

            var dragging = false;
            var removeFunction = false;

            var wireInModel = function(source, target, editorModel) {
                if (target.func !== source.func) {
                    this.wireUp(target.func, source.func, target, source);
                    if (target.type === "output") {
                        if (source.func.type === "functionInput")
                            editorModel.linkOutput(source.func.inputName)
                        else
                            editorModel.linkOutput(source.func.modelId)
                    } else if (source.func.modelId !== undefined)
                        editorModel.linkInput(target.func.modelId, target.name, source.func.modelId)
                    else
                        editorModel.linkInput(target.func.modelId, target.name, source.func.inputName)
                }
            }
            wireInModel = _.bind(wireInModel, this)

            //TODO: Replace all colours with some backbone model/view/something holding names of colours. Based on CSS instead?
            function addWire(fabricEvent) {
                var x = fabricEvent.layerX
                var y = fabricEvent.layerY
                var wire = new fabric.Path("M" + x + "," + y + " C" + x + "," + y + " " + x + "," + y + " " + x + "," + y, {
                    fill        : "",
                    strokeWidth : 4,
                    stroke      : '#2BA6CB',
                    selectable  : false
                })

                canvas.add(wire);
                wire.sendToBack();
                return wire;
            }

            //TODO: Refactor out fromInput/fromOutput
            canvas.on({'mouse:down' : _.bind(function (e) {
                var target = e.target
                if (target !== undefined && target.type === "functionOutput") {
                    canvas.remove(wire);
                    if (fromInput) {
                        wireInModel(target, source, this.editorModel)
                    } else {
                        fromOutput = true;
                        wire = addWire(e.e);
                        source = target;
                    }
                    fromInput = false;
                } else if (target !== undefined && (target.type === "input" || target.type === "output")) {
                    canvas.remove(wire);
                    if (fromOutput) {
                        wireInModel(source, target, this.editorModel)
                    } else {
                        fromInput = true;
                        wire = addWire(e.e);
                        source = target;
                    }
                    fromOutput = false;
                    /*} else if (target !== undefined && target.type === "wire") {
                     console.log("remove wire")*/
                } else if (target !== undefined && target.type === "function") {
                    this.showEdges()
                    dragging = true;
                } else if (target !== undefined && target.type === "ex") {
                    this.editorModel.removeInput(target.input)
                    this.render()
                } else {
                    fromOutput = fromInput = false;
                    canvas.remove(wire);
                }
            }, this)});

            canvas.on({'mouse:up' : _.bind(function (e) {
                dragging = false;
                this.hideEdges()
                if (removeFunction && e.target !== undefined) {
                    this.editorModel.removeFunction(e.target.modelId)
                    this.render()
                }

                removeFunction = false;
            },this)})

            canvas.on({'mouse:move' : _.bind(function (e) {
                if (fromOutput || fromInput) {
                    var x = wire.path[0][1]
                    var y = wire.path[0][2]
                    var xp = e.e.layerX
                    var yp = e.e.layerY
                    var controlMid = ((x + xp) / 2)
                    wire.path[1][1] = controlMid
                    wire.path[1][2] = y
                    wire.path[1][3] = controlMid
                    wire.path[1][4] = yp
                    wire.path[1][5] = xp
                    wire.path[1][6] = yp
                    canvas.renderAll()
                }
                if (dragging) {
                    if (e.e.layerX < 20 || e.e.layerX > canvas.getWidth() - 20 || e.e.layerY < 20 || e.e.layerY > canvas.getHeight() - 20) {
                        this.edges.setFill(this.edges.selectedFill)
                        removeFunction = true;
                    } else {
                        this.edges.setFill(this.edges.unselectedFill)
                        removeFunction = false;
                    }
                }
            },this)})
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
        }, onNewFunction    : function (funcModel, funcImpl, box) {
            box.modelId = funcImpl.name

            box.on('moving', _.bind(function () {
                this.editorModel.move(box.modelId, box.getLeft(), box.getTop())
            }, this))

            this.canvas.renderAll()

        }, addFunction      : function (func) {
            var funcModel = {function : func.name, y : 50, x : 100, name : this.createGUID(), inputs : {}, arg : func.arg};
            this.newFunction(func, funcModel)
            this.editorModel.addFunction(funcModel)
            this.canvas.renderAll()
        },
        addInput            : function (name) {
            if (this.editorModel.addInput(name))
                this.render()
            else
                alertify.error("Input with name " + name + " already exists")

        },
        onNewInput          : function (name, input) {
            var ex = new fabric.Rect(
                { top : input.top, left : input.left - input.width / 2 + 10, width : 20, height : input.height - 2}
            );
            ex.hoverFill = "rgba(198, 15, 19, .2)"
            ex.fullFill = "rgba(198, 15, 19, .9)"
            ex.noFill = "rgba(0,0,0,0)"
            ex.setFill(ex.noFill)
            ex.type = "ex"
            ex.input = name
            ex.hovered = false
            ex.hasControls = ex.hasBorders = false;
            ex.lockMovementX = ex.lockMovementY = true;

            input.ex = ex
            this.canvas.add(ex)
        }
    })));
});