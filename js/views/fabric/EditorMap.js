define([
    'backbone',
    'fabric',
    'views/fabric/MapCore',
    'alertify'
], function (Backbone, fabric, MapCore, alertify) {
    var pds2398 = 'rgb(187,228,238)';
    var pds2391 = 'rgb(0,172,205)';

    return new (Backbone.View.extend(_.extend(new MapCore(), {
        onInit              : function (canvas) {
            canvas.on('object:over', _.bind(function (e) {
                var target = e.target
                target.oldfill = target.getFill()
                switch (target.type) {
                    //If hover over wires or functions
                    case("wire"):
                        target.oldfill = target.getStroke();
                        break;
                    case("input"):
                        target.setFill(pds2391);
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
                        break;
                    case("functionInput"):
                        target.hoverText = new fabric.Text(target.inputName, {
                            fontSize     : 16,
                            left         : target.getLeft() + target.width / 2 + 5,
                            top          : target.getTop() - target.height / 2 + 16,
                            lineHeight   : 1,
                            fontFamily   : 'Helvetica',
                            fontWeight   : 'bold',
                            'text-align' : 'left'
                        });
                        target.hoverText.left = target.hoverText.left + (target.hoverText.width / 2)
                        this.canvas.add(target.hoverText);
                    case("output"):
                    case("functionOutput"):
                        target.setFill(pds2391);
                        break;
                    case("ex"):
                        target.hoverText = new fabric.Text("Remove argument " + target.input.inputName, {
                            fontSize     : 16,
                            left         : target.getLeft() + target.width / 2 + 5,
                            top          : target.getTop() - target.height / 2 + 8,
                            lineHeight   : 1,
                            fontFamily   : 'Helvetica',
                            fontWeight   : 'bold',
                            'text-align' : 'left'
                        });
                        target.hoverText.left = target.hoverText.left + (target.hoverText.width / 2)
                        this.canvas.add(target.hoverText);
                        target.setFill(target.hoverFill)
                        break;
                    case("addFunction"):
                        target.hoverText = new fabric.Text("Add a new input", {
                            fontSize     : 16,
                            left         : target.getLeft() + target.width / 2 + 5,
                            top          : target.getTop() - target.height / 2 + 8,
                            lineHeight   : 1,
                            fontFamily   : 'Helvetica',
                            fontWeight   : 'bold',
                            'text-align' : 'left'
                        });
                        target.hoverText.left = target.hoverText.left + (target.hoverText.width / 2)
                        this.canvas.add(target.hoverText);
                        target.setFill(target.hoverFill)
                        break;
                    default:
                        break;
                }

                canvas.renderAll();
            }, this));

            canvas.on('object:out', function (e) {
                var target = e.target
                switch (target.type) {
                    case("wire"):
                        target.setStroke(target.oldfill);
                        break;
                    default :
                        target.setFill(target.oldfill);
                        break;
                }
                if (target.hoverText !== undefined) {
                    canvas.remove(target.hoverText)
                    delete target.hoverText
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

            var wireInModel = function (source, target, editorModel) {
                if (target.func !== source.func) {
                    if (target.type === "output") {
                        if (source.func.type === "functionInput")
                            editorModel.linkOutput(source.func.inputName)
                        else
                            editorModel.linkOutput(source.func.modelId)
                    } else if (source.func.modelId !== undefined)
                        editorModel.linkInput(target.func.modelId, target.name, source.func.modelId)
                    else
                        editorModel.linkInput(target.func.modelId, target.name, source.func.inputName)
                    this.render();
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

            canvas.on({'mouse:down' : _.bind(function (e) {
                var target = e.target
                if (typeof target !== "undefined") {
                    switch (target.type) {
                        case("functionInput"):
                        case("functionOutput"):
                            canvas.remove(wire);
                            if (fromInput) {
                                wireInModel(target, source, this.editorModel)
                            } else {
                                fromOutput = true;
                                wire = addWire(e.e);
                                source = target;
                            }
                            fromInput = false;
                            break;
                        case("input"):
                        case("output"):
                            canvas.remove(wire);
                            if (fromOutput) {
                                wireInModel(source, target, this.editorModel)
                            } else {
                                fromInput = true;
                                wire = addWire(e.e);
                                source = target;
                            }
                            fromOutput = false;
                            break;
                        case("function"):
                            this.canvas.remove(this._out)
                            this.showEdges()
                            dragging = true;
                            break;
                        case("ex"):
                            this.editorModel.removeInput(target.input.inputName)
                            this.render()
                            break;
                        case("addFunction"):
                            alertify.prompt("Chose a name for the new input:", _.bind(function (e, str) {
                                if (e) {
                                    this.editorModel.addInput(str);
                                    this.render();
                                }
                            }, this))
                            break;
                        default:
                            break;

                    }
                } else {
                    fromOutput = fromInput = false;
                    canvas.remove(wire);
                }

            }, this)
            });

            canvas.on({'mouse:up' : _.bind(function (e) {
                dragging = false;
                this.canvas.add(this._out)
                this.hideEdges()
                if (removeFunction && e.target !== undefined) {
                    this.editorModel.removeFunction(e.target.modelId)
                    this.render()
                }

                removeFunction = false;
            }, this)})

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
            }, this)})
        },
        el                  : "#editorMap",
        maxHeightPercentage : 0.8,
        showEdges           : function () {
            this.canvas.add(this.edges)
            this.edges.setFill(this.edges.unselectedFill)
        },
        hideEdges           : function () {
            this.canvas.remove(this.edges)
        },
        onResize            : function (h, w) {
            var left = new fabric.Rect({left : 10, top : h / 2, width : 20, height : h});
            var right = new fabric.Rect({left : w - 10, top : h / 2, width : 20, height : h});
            var top = new fabric.Rect({left : w / 2, top : 10, width : w - 40, height : 20})
            var bottom = new fabric.Rect({left : w / 2, top : h - 10, width : w - 40, height : 20})
            this.edges = new fabric.Group([left, right, top, bottom])
            this.edges.selectable = false
            this.edges.unselectedFill = "rgba(198, 15, 19, .2)"
            this.edges.selectedFill = "rgba(198, 15, 19, .9)"
            this.edges.setFill(this.edges.unselectedFill)
        },
        onRender            : function () {
            var canvas = this.canvas
            var height = 30
            var width = 20
            var top = canvas.height - height / 2
            var left = width / 2

            var ex = new fabric.Rect(
                { top : top, left : left, width : width, height : height, stroke : 0, fill : pds2398}
            );

            ex.hoverFill = pds2391
            ex.type = "addFunction"
            ex.hovered = false
            ex.hasControls = ex.hasBorders = false;
            ex.lockMovementX = ex.lockMovementY = true;

            this.canvas.add(ex)

            this.newLegend([
                {color : this.getColor("num"), name : "Number"},
                {color : this.getColor("bool"), name : "Boolean"},
                {color : this.getColor("string"), name : "String"},
                {color : this.getColor("unknown"), name : "Any"}
            ])
        },
        onNewFunction       : function (funcModel, funcImpl, box) {
            box.modelId = funcImpl.name
            box.on('moving', _.bind(function () {
                this.editorModel.move(box.modelId, box.getLeft(), box.getTop())
            }, this))
        },
        addFunction         : function (func) {
            if (typeof this.editorModel !== "undefined" && typeof this.editorModel.has("map")) {
                var funcModel = {function : func.name, y : 50, x : 100, name : this.createGUID(), inputs : {}, arg : func.arg};
                this.newFunction(func, funcModel)
                this.editorModel.addFunction(funcModel)
                this.render()
            }
        },
        addInput            : function (name) {
            if (this.editorModel.addInput(name))
                this.render()
            else
                alertify.error("Input with name " + name + " already exists")

        },
        onNewInput          : function (name, input) {
            var height = 20
            var top = input.top + input.height / 2 + height / 2
            var left = input.left
            var width = input.width

            var ex = new fabric.Rect(
                { top : top, left : left, width : width, height : height, stroke : 0, fill : "rgba(198, 15, 19, .2)"}
            );

            ex.hoverFill = "rgba(198, 15, 19, .9)"
            ex.type = "ex"
            ex.input = name
            ex.hovered = false
            ex.hasControls = ex.hasBorders = false;
            ex.lockMovementX = ex.lockMovementY = true;

            ex.input = input
            this.canvas.add(ex)
        },
        beforeRender        : function () {
            if (typeof this.editorModel === "undefined" || typeof this.editorModel.has("map") === "undefined") {
                var text = new fabric.Text("No function selected, click the Add Local Function button above", {
                    fontSize     : 16,
                    left         : 27,
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
        },
        moving              : true
    })));
})
;