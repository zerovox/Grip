define([
    'backbone',
    'fabric',
    'alertify',
    'views/fabric/Function'
], function (Backbone, fabric, alertify, Function) {

    /*
    The core of the Map views.
    Methods called:
        onInit(canvas)
        onWired(wire from, wire to, wire)
        onResize(height, width)
        onRender
        onNewFunction(funcReal, func, box)
     */

    return function () {
        return {
            initialize  : function () {
                var canvas = this.canvas = new fabric.Canvas(this.el, {selection : false});
                var that = this;
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

                if(this.onInit)
                    this.onInit(canvas)
            },
            set         : function (editorModel, functionsCollection, editors) {
                //TODO: Rework this
                this.editorMap = editorModel
                if (typeof editorModel !== "undefined") {
                    if (this.editorMap.functions === undefined)
                        this.editorMap.functions = {}
                    if (this.editorMap.inputs === undefined)
                        this.editorMap.inputs = {}
                    if (this.functions === undefined || functionsCollection !== undefined)
                        this.functions = functionsCollection
                    this.editors = editors
                    this.resize()
                }
            },
            render      : function () {
                var canvas = this.canvas
                var map = this.editorMap
                canvas.clear()
                if (typeof map !== "undefined") {

                    //Store an ordered list of functions. Ordering is the same as the original model. Used to wire up the view.
                    var functions = {}
                    //For each function, add to canvas then add to list above.
                    _.each(map.functions, function (func, name) {
                        var fullFunction = this.functions.find(function (funcp) {
                            return funcp.get("func").name === func.function;
                        })
                        //Find the 'real' function that corresponds to this functionModel
                        var ff;
                        if (typeof fullFunction !== "undefined") {
                            func.name = name;
                            if (func.arg !== undefined) {
                                ff = fullFunction.get("func")['new'](func.arg);
                            } else {
                                ff = fullFunction.get("func");
                            }
                        } else {
                            var editor = this.editors.find(function (ed) {
                                return ed.get("name") === func.function
                            })
                            var inputs = []
                            _.each(editor.get("map").inputs, function (map, name) {
                                inputs.push(name)
                            })
                            ff = {name : func.function, inputs : inputs}
                        }
                        functions[name] = this.newFunction(ff, func);

                    }, this)

                    //Store a mapping of arguments based on name. Used to wire up the view
                    //For each input, add to canvas and then add to the mapping above
                    var index = 0;
                    _.each(map.inputs, function (input, name) {
                        functions[name] = this.newInput(name, index, _.size(map.inputs));
                        index++
                    }, this);

                    //For each function, add a wire from any inputs to their targets
                    _.each(functions, function (func) {
                        _.each(func.inputs, function (inp) {
                            if (inp.wireTo !== undefined && functions[inp.wireTo] !== undefined) {
                                this.wireUp(func, functions[inp.wireTo], inp, functions[inp.wireTo].output)
                            }
                        }, this);
                    }, this)

                    var out = this.newOutput();
                    if (map.output !== undefined) {
                        this.wireUp(undefined, functions[map.output], out, functions[map.output].output)
                    }
                }
                if(this.onRender)
                    this.onRender()

            },
            wireUp      : function (func, func2, inp, out) {
                var canvas = this.canvas;
                canvas.remove(inp.wire)
                var fill = '#2284A1';

                var wire = new fabric.Line([inp.getLeft(), inp.getTop(), out.getLeft(), out.getTop()], {
                    fill        : fill,
                    strokeWidth : 2
                })
                wire.lockMovementX = wire.lockMovementY = true;
                wire.hasBorders = wire.hasControls = false;
                wire.type = "wire"
                canvas.add(wire)
                inp.wire = wire
                wire.sendToBack();

                function rewire() {
                    var context = canvas.getContext();
                    wire.set({ 'x1' : inp.getLeft(), 'y1' : inp.getTop() })
                    wire.set({ 'x2' : out.getLeft(), 'y2' : out.getTop() })
                    wire.render(context);
                }

                if (func !== undefined) {
                    func.on('moving', rewire)
                }
                if (func2 !== undefined) {
                    func2.on('moving', rewire)
                }

                if(this.onWired)
                    this.onWired(func, func2, wire)

                //Only render this after we've called out to onWired
                rewire();
            },
            newInput    : function (name, x, y) {
                var canvas = this.canvas;
                var height = 40;
                var width = 160
                var options = {top : ((x + 1) / (y + 1)) * (canvas.height) + (height / 2), left : width / 2};
                var box = new Function(name, height, width, options);
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
            newFunction : function (funcReal, func) {
                var canvas = this.canvas;
                var height = Math.max(40, 40 * funcReal.inputs.length);
                var width = 160
                var options = {top : func.y, left : func.x};
                var box = new Function(funcReal.name, height, width, options, func.arg);
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
                        input.render(canvas.getContext())
                    }

                    box.on('moving', function () {
                        positionInput(box)
                    })
                    positionInput(box);
                    if (func.inputs !== undefined) {
                        var inp = func.inputs[name]
                        if (inp !== undefined)
                            input.wireTo = inp.wired;
                    }
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
                    output.render(canvas.getContext())
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

                box.type = "function"
                box.output = output;
                box.functionModel = func;

                if(this.onNewFunction)
                    this.onNewFunction(funcReal, func, box)

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
                var h = Math.max(200, ($(window).height() - 100) * this.maxHeightPercentage);
                var w = $(window).width() > 999 ? $(window).width() * 10 / 12 - 40 : $(window).width() - 40;
                canvas.setHeight(h);
                canvas.setWidth(w);
                if(this.onResize)
                    this.onResize(h, w)
                this.render();
            },
            createGUID  : function () {
                //Snippet to generate a guid from http://stackoverflow.com/a/2117523. Any code with a very high probability of no collisions would work here. I'm surprised Javascript doesn't have generation of GUIDs as a built in function
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }, hide     : function () {
                this.$el.parent().hide();
            }, show     : function () {
                this.$el.parent().show();
            }
        }


    }

});