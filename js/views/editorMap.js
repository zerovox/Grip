define([
    'backbone',
    'fabric',
    'channels'
], function (Backbone, fabric, channels) {

    return Backbone.View.extend({
        initialize  : function () {
            var that = this;
            var canvas = this.canvas = new fabric.Canvas('editorMap', {selection : false});
            $(window).resize(function () {that.resize()});

            canvas.findTarget = (function (originalFn) {
                return function () {
                    var target = originalFn.apply(this, arguments);
                    if (target) {
                        if (this._hoveredTarget !== target) {
                            canvas.fire('object:over', { target : target });
                            if (this._hoveredTarget) {
                                canvas.fire('object:out', { target : this._hoveredTarget });
                            }
                            this._hoveredTarget = target;
                        }
                    }
                    else if (this._hoveredTarget) {
                        canvas.fire('object:out', { target : this._hoveredTarget });
                        this._hoveredTarget = null;
                    }
                    return target;
                };
            })(canvas.findTarget);

            canvas.on('object:over', function (e) {
                e.target.oldfill = e.target.getFill();

                //If hover over wires or functions, show remove target, in center, on click remove object
                if (e.target.type !== undefined && e.target.type === "wire")
                    e.target.setFill('red');
                else
                    e.target.setFill('#2BA6CB');
                canvas.renderAll();
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

            canvas.on({'mouse:down' : function (e) {
                var target = e.target
                if (target !== undefined && target.type === "functionOutput") {
                    canvas.remove(wire);
                    if (fromInput) {
                        if (target.func !== source.func) {
                            that.wireUp(source.func, target.func, source, target)
                            if (source.type === "output")
                                that.editor.get("map").output = target.func.functionModel.name
                            else if (target.func.functionModel !== undefined)
                                source.func.functionModel.inputs[source.name] = target.func.functionModel.name
                            else
                                source.func.functionModel.inputs[source.name] = target.func.inputName

                        }
                    } else {
                        fromOutput = true;
                        wire = new fabric.Line([e.e.layerX, e.e.layerY], {
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
                                that.editor.get("map").output = source.func.functionModel.name
                            else if (source.func.functionModel !== undefined)
                                target.func.functionModel.inputs[target.name] = source.func.functionModel.name
                            else
                                target.func.functionModel.inputs[target.name] = source.func.inputName
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
                } else {
                    fromOutput = fromInput = false;
                    canvas.remove(wire);
                }
            }});

            canvas.on({'mouse:move' : function (e) {
                if (fromOutput || fromInput) {
                    wire.set({ 'x2' : e.e.layerX, 'y2' : e.e.layerY });
                    canvas.renderAll()
                }
            }})

            channels.map.on("add", function (func) {
                var funcModel = {function : func.name, y : 0, x : 0, name : this.createGUID(), inputs : {}, arg : func.arg};
                this.newFunction(func, funcModel)
                this.editor.get("map").functions[funcModel.name] = funcModel;
            }, this);

            channels.map.on("addInput", function (name) {
                if (_.contains(this.editor.get("map").inputs, name)) {
                    console.log("log the fail reason here once we have logging included")
                } else {
                    this.editor.get("map").inputs.push(name);
                    this.render();
                }
            }, this);
        },
        set         : function (editorModel, functionsCollection) {
            this.editor = editorModel
            if (editorModel.get("map").functions === undefined)
                editorModel.get("map").functions = {}
            if (editorModel.get("map").inputs === undefined)
                editorModel.get("map").inputs = []
            this.functions = functionsCollection
            this.resize()
        },
        render      : function () {
            var canvas = this.canvas
            var map = this.editor.get("map")
            canvas.clear()

            //Store an ordered list of functions. Ordering is the same as the original model. Used to wire up the view.
            var functions = {}
            //For each function, add to canvas then add to list above.
            _.each(map.functions, function (func, name) {
                var fullFunction = this.functions.find(function (funcp) {
                    return funcp.get("func").name === func.function;
                })
                //Find the 'real' function that corresponds to this functionModel
                func.name = name;
                var ff;
                if (func.arg !== undefined) {
                    ff = fullFunction.get("func")['new'](func.arg);
                } else {
                    ff = fullFunction.get("func");
                }
                functions[name] = this.newFunction(ff, func);

            }, this)

            //Store a mapping of arguments based on name. Used to wire up the view
            //For each input, add to canvas and then add to the mapping above
            _.each(map.inputs, function (inputName, index) {
                functions[inputName] = this.newInput(inputName, index, this.editor.get("map").inputs.length);
            }, this);

            //For each function, add a wire from any inputs to their targets
            _.each(functions, function (func) {
                _.each(func.inputs, function (inp) {
                    if (inp.wireTo !== undefined) {
                        this.wireUp(func, functions[inp.wireTo], inp, functions[inp.wireTo].output)
                    }
                }, this);
            }, this)

            var out = this.newOutput();
            if (map.output !== undefined) {
                this.wireUp(undefined, functions[map.output], out, functions[map.output].output)
            }

        },
        wireUp      : function (func, func2, inp, out) {
            var canvas = this.canvas;
            canvas.remove(inp.wire)

            var wire = new fabric.Line([inp.getLeft(), inp.getTop(), out.getLeft(), out.getTop()], {
                fill        : '#2284A1',
                strokeWidth : 2
            })
            wire.lockMovementX = wire.lockMovementY = true;
            wire.hasBorders = wire.hasControls = false;
            wire.type = "wire"
            canvas.add(wire)
            inp.wire = wire
            wire.sendToBack();

            function rewire(inp) {
                wire.set({ 'x1' : inp.getLeft(), 'y1' : inp.getTop() });
                canvas.renderAll();
            }

            function rewire2(inp) {
                wire.set({ 'x2' : inp.getLeft(), 'y2' : inp.getTop() });
                canvas.renderAll();
            }

            if (func !== undefined) {
                func.on('moving', function () {
                    rewire(inp)
                    rewire2(out)
                })
            }
            if (func2 !== undefined) {
                func2.on('moving', function () {
                    rewire(inp)
                    rewire2(out)
                })
            }
            rewire(inp);
            rewire2(out);
        },
        newInput    : function (name, x, y) {
            var canvas = this.canvas;
            var height = 40;
            var width = 160
            var options = {top : ((x + 1) / (y + 1)) * (canvas.height) + (height / 2), left : width / 2};
            var box = new this.Function(name, height, width, options);
            var output = new fabric.Circle({radius : 10, fill : 'grey', top : ((x + 1) / (y + 1)) * (canvas.height) + (height / 2), left : width})

            box.hasControls = box.hasBorders = output.hasControls = output.hasBorders = false;
            box.lockMovementX = box.lockMovementY = output.lockMovementX = output.lockMovementY = true;
            output.type = "functionOutput";
            output.func = box;
            box.output = output;
            box.inputName = name;
            canvas.add(box)
            canvas.add(output)
            return box;
        },
        Function    : fabric.util.createClass(fabric.Object, {
            initialize : function (name, x, y, options, arg) {
                this.height = x;
                this.width = y;
                this.callSuper('initialize', options)
                this.name = name;
                this.arg = arg;
            },
            _render    : function (ctx) {
                //ctx :: CanvasRenderingContext2D
                ctx.textAlight = "center"
                ctx.strokeStyle = "#2284A1"
                ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.beginPath();
                ctx.arc(this.width / 2 - 1, 0, 10, -Math.PI / 2, Math.PI / 2)
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#fff"
                ctx.textAlign = 'center'
                if (this.arg !== undefined)
                    ctx.fillText(this.arg, 0, 0, this.width - 20);
                else
                    ctx.fillText(this.name, 0, 0, this.width - 20);
            }

        }),
        newFunction : function (funcReal, func) {
            var canvas = this.canvas;
            var height = Math.max(40, 40 * funcReal.inputs.length);
            var width = 160
            var options = {top : func.y, left : func.x};
            var box = new this.Function(funcReal.name, height, width, options, func.arg);
            box.hasControls = box.hasBorders = false;
            canvas.add(box)
            box.inputs = {}
            _.each(funcReal.inputs, function (name, index) {

                var input = new fabric.Circle({radius : 10, fill : 'grey'})
                input.hasControls = input.hasBorders = false;
                input.lockMovementX = input.lockMovementY = true;
                input.type = "input";
                canvas.add(input)

                function positionInput(box) {
                    input.setTop(box.getTop() - height / 2 + ((index + 1) / (funcReal.inputs.length + 1)) * height).setCoords();
                    input.setLeft(box.getLeft() - width / 2).setCoords();
                    canvas.renderAll();
                }

                box.on('moving', function () {
                    positionInput(box)
                })
                positionInput(box);
                if (func.inputs !== undefined)
                    input.wireTo = func.inputs[name]
                input.func = box;
                input.name = name;
                box.inputs[name] = input
            })

            var output = new fabric.Circle({radius : 10, fill : 'grey'})
            output.hasControls = output.hasBorders = false;
            output.lockMovementX = output.lockMovementY = true;

            output.type = "functionOutput";
            output.func = box;
            canvas.add(output)

            function positionOutput(box) {
                output.setTop(box.getTop()).setCoords();
                output.setLeft(box.getLeft() + width / 2).setCoords();
                canvas.renderAll();
            }

            positionOutput(box);

            function updateModel(box) {
                box.functionModel.x = box.getLeft()
                box.functionModel.y = box.getTop()
            }

            box.on('moving', function () {
                positionOutput(box)
                updateModel(box)
            })

            box.output = output;
            box.functionModel = func;
            return box;
        },
        newOutput   : function () {
            var canvas = this.canvas;
            var box = new fabric.Circle({radius : 30, fill : 'grey', top : (canvas.height / 2), left : canvas.width})

            box.hasControls = box.hasBorders = false;
            box.lockMovementX = box.lockMovementY = true;
            box.input = this;
            box.type = "output";
            canvas.add(box)
            return box;
        },
        resize      : function () {
            var canvas = this.canvas;
            var h = Math.max(400, ($(window).height() - 200) * 0.9);
            var w = $(window).width() > 800 ? $(window).width() * 10 / 12 - 40 : $(window).width() - 40;
            canvas.setHeight(h);
            canvas.setWidth(w);

            //We re-render every time the window is resized. Prevents elements going off the edge of the screen
            this.render();
        },
        createGUID  : function () {
            //Snippet to generate a guid from http://stackoverflow.com/a/2117523. Any code with a very high probability of no collisions would work here. I'm surprised Javascript doesn't have generation of GUIDs as a build in function
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    })
        ;

})
;