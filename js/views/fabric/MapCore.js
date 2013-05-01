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
     onNewInput(inputName, inputObject)
     */

    var pds2398 = 'rgb(187,228,238)';
    var numFill = 'rgb(222,173,193)';
    var boolFill = 'rgb(232,189,167)';
    var strFill = 'rgb(200,230,170)';
    var num = {type : "num"}
    var bool = {type : "bool"}
    var str = {type : "string"}

    function getColor(attrs) {
        if (typeof attrs !== "undefined") {
            var type;
            if ("infType" in attrs) {
                type = attrs.infType;
            } else if ("type" in attrs) {
                type = attrs.type;
            } else {
                return pds2398;
            }

            if (_.isEqual(type, num))
                return numFill
            if (_.isEqual(type, str))
                return strFill
            if (_.isEqual(type, bool))
                return boolFill
        }
        return pds2398;
    }

    return function () {
        return {
            initialize          : function () {
                this.full = false;
                //Define a canvas, disable selection
                var canvas = this.canvas = new fabric.Canvas(this.el, {selection : false});
                //Add our window resize triggers
                $(window).resize(_.bind(function () {
                    this.resize()
                    this.render()
                }, this));
                //Make sure the canvas is the correct size
                this.resize()

                //Record a pointer to the original findTarget method, allowing us to refer to it after we overwrite the original
                this.ft = canvas.findTarget;

                //This wraps the existing fabric findTarget events with extra 'object:over' and 'object:out' events, fired when a the mouse is moved over and then off a fabric object.
                //This allows us to easily attach events to the action of hovering over an object.
                this.addFindTargetEvents(canvas)

                //If present, call onInit
                if (this.onInit)
                    this.onInit(canvas)
            },
            addFindTargetEvents : function (canvas) {
                //TODO: Adjust find target for fullscreen
                //Piggyback on canvas.findTarget : https://github.com/kangax/fabric.js/wiki/Working-with-events
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
                })(this.ft);
            },
            set                 : function (editorModel, functionsCollection, editors) {
                this.editorModel = editorModel
                this.functions = functionsCollection
                this.editors = editors
                this.render()
                return this; //Allow set to be chained
            },
            render              : function () {
                //Alias the canvas for simplicity
                var canvas = this.canvas
                //Clear the canvas
                canvas.clear()
                //We start with 0 legends
                this.legends = 0;
                //If present, call the beforeRender handler.
                if (this.beforeRender)
                    this.beforeRender()
                //Check we have an editor to render
                if (typeof this.editorModel !== "undefined" && typeof this.editorModel.has("map") !== "undefined") {
                    //Infer types for the model, bit of a hack to place it here. Really we want to reinfer when any function changes its type
                    this.editorModel._infTypes()
                    //Get the editor we wish to draw
                    var map = this.editorModel.get("map")
                    //Add each function to the canvas and to our local functions mapping, used add the wires later on.
                    var functions = _.reduce(map.functions, function (functions, func, name) {
                        //Find the primitive function model that corresponds to this function instance
                        var primitive = this.functions.find(function (funcp) {
                            return funcp.get("func").name === func.function;
                        })
                        if (typeof primitive !== "undefined") {
                            //If the primitive model was found, we need to grab the primitive function itself.
                            func.name = name;
                            if (func.arg !== undefined) {
                                //If an argument was found(like in the case of a constant), we instantiate a new copy of the function with this argument, then add it to the view
                                functions[name] = this.newFunction(primitive.get("func")['new'](func.arg), func);
                            } else {
                                //Otherwise, we just grab the pre-existing primitive and add this instance to the view
                                functions[name] = this.newFunction(primitive.get("func"), func);
                            }
                        } else {
                            //If no primitive was found, it will be a local function. Find the local function with this name.
                            var editor = this.editors.find(function (ed) {
                                return ed.get("name") === func.function
                            })
                            //Create an array of input names for this local function
                            var inputs = _.reduce(editor.get("map").inputs, function (inputs, map, name) {
                                inputs[name] = {}
                                return inputs;
                            }, {})
                            //Add the local function to the view
                            functions[name] = this.newFunction({name : func.function, inputs : inputs}, func);
                        }
                        return functions;
                    }, {}, this)

                    //For each input to the function, add a new input box to the canvas and then add to the mapping above
                    var index = 0;
                    _.each(map.inputs, function (input, name) {
                        functions[name] = this.newInput(name, index, _.size(map.inputs), input);
                        index++
                    }, this);

                    //For each function, add a wire from any inputs to their targets
                    _.each(functions, function (func) {
                        _.each(func.inputs, function (inp) {
                            if (typeof inp.wireTo !== "undefined" && typeof functions[inp.wireTo] !== "undefined") {
                                this.wireUp(func, functions[inp.wireTo], inp, functions[inp.wireTo].output)
                            }
                        }, this);
                    }, this)

                    //Finally, add the output to the function to the view, and add a wire if necessary.
                    var out = this.newOutput(this.editorModel);
                    if (typeof map.output !== "undefined") {
                        this.wireUp(undefined, functions[map.output], out, functions[map.output].output)
                    }
                    this._out = out;
                    //If present, call the post-render callback
                    if (this.onRender)
                        this.onRender(canvas)
                }
            },
            wireUp              : function (func, func2, inp, out) {
                var canvas = this.canvas;
                canvas.remove(inp.wire)
                delete inp.wire
                var fill;

                if (inp.getFill() == out.getFill())
                    fill = inp.getFill()
                else
                    fill = "red"

                var wire = new fabric.Path("M" + inp.getLeft() + "," + inp.getTop() + " C" + ((out.getLeft() + inp.getLeft()) / 2) + "," + inp.getTop() + " " + ((out.getLeft() + inp.getLeft()) / 2) + "," + out.getTop() + " " + out.getLeft() + "," + out.getTop(), {
                    fill        : "",
                    strokeWidth : 4,
                    stroke      : fill
                })

                this.lock(wire)
                wire.type = "wire"
                inp.wire = wire

                canvas.add(wire)

                function rewire(inp) {
                    if (typeof inp !== "undefined" && "wire" in inp && inp.wire == wire) {
                        var context = canvas.getContext();
                        var controlMid = ((out.getLeft() + inp.getLeft()) / 2)
                        wire.path[0][1] = inp.getLeft()
                        wire.path[0][2] = inp.getTop()
                        wire.path[1][1] = controlMid
                        wire.path[1][2] = inp.getTop()
                        wire.path[1][3] = controlMid
                        wire.path[1][4] = out.getTop()
                        wire.path[1][5] = out.getLeft()
                        wire.path[1][6] = out.getTop()
                        wire.render(context);
                        wire.sendToBack();
                    }
                }

                if (this.moving) {
                    if (func !== undefined && func.type === "function") {
                        func.on('moving', function () {rewire(inp)})
                    }
                    if (func2 !== undefined && func2.type === "function") {
                        func2.on('moving', function () {rewire(inp)})
                    }
                }
                if (this.onWired)
                    this.onWired(inp, out, wire)
                rewire(inp)
                return wire;
            },
            newInput            : function (name, x, y, input) {
                var canvas = this.canvas;
                var nudge = 30;
                var height = (1 / y) * (canvas.height - 40) - nudge
                var top = (x / y) * (canvas.height - 40) + height / 2

                var width = 20;
                //TODO: Change x and y to be the number of input out of how many
                var fill = getColor(input);
                var box = new fabric.Rect({width : width, height : height, fill : fill, top : top, left : width / 2, stroke : 0})
                box.type = "functionInput";
                box.func = box;
                box.output = box;
                box.inputName = name;
                this.lock(box)
                box.input = input
                canvas.add(box)
                if (this.onNewInput)
                    this.onNewInput(name, box)
                return box;
            },
            newFunction         : function (funcReal, func) {
                var canvas = this.canvas;
                var height = Math.max(40, 40 * _.size(funcReal.inputs));
                var width = 140
                var x = Math.min(func.x, canvas.width)
                var y = Math.min(func.y, canvas.height)
                var options = {top : y, left : x};
                var box = new Function(funcReal.name, height, width, options, func.arg);
                box.hasControls = box.hasBorders = false;
                canvas.add(box)

                box.inputs = {}
                var index = 0;
                _.each(funcReal.inputs, function (attrs, name) {
                        var i = index;
                        var fill;
                        if (func.inputs !== undefined && name in func.inputs)
                            fill = getColor(func.inputs[name])
                        else
                            fill = getColor(attrs)

                        var input = new fabric.Rect({width : 20, height : 39, fill : fill, stroke : 0})
                        this.lock(input)
                        input.type = "input";
                        canvas.add(input)

                        if (func.inputs !== undefined) {
                            var inp = func.inputs[name]
                            if (inp !== undefined)
                                input.wireTo = inp.wired;
                        }
                        input.func = box;
                        input.name = name;
                        box.inputs[name] = input

                        function positionInput(box) {
                            input.setTop(box.getTop() + ((i) * 40) - height / 2 + 20).setCoords();
                            input.setLeft(box.getLeft() - width / 2 - 10).setCoords();
                            input.render(canvas.getContext())
                        }

                        if (this.moving) {
                            box.on('moving', function () {
                                positionInput(box)
                            })
                        }

                        positionInput(box);
                        index++;
                    }, this
                )
                var fill;
                if (typeof func.output !== "undefined" && "infType" in func.output)
                    fill = getColor(func.output)
                else
                    fill = getColor(funcReal.output)

                var output = new fabric.Rect({width : 10, height : height, fill : fill, stroke : 0})
                this.lock(output)
                output.type = "functionOutput";
                output.func = box;
                canvas.add(output)
                output.sendToBack();

                box.type = "function"
                box.output = output;

                function positionOutput(box) {
                    output.setTop(box.getTop()).setCoords();
                    output.setLeft(box.getLeft() + 5 + width / 2).setCoords();
                    output.render(canvas.getContext())
                }

                if (this.moving) {
                    box.on('moving', function () {
                        positionOutput(box)
                    })
                }
                positionOutput(box);
                if (this.onNewFunction)
                    this.onNewFunction(funcReal, func, box)
                return box;
            },
            newOutput           : function (model) {
                var canvas = this.canvas;
                var fill;
                if ("output" in model)
                    fill = getColor(model.output)
                else
                    fill = pds2398;
                var box = new fabric.Rect({height : canvas.height, width : 30, fill : fill, top : (canvas.height / 2), left : canvas.width - 10, stroke : 0})

                this.lock(box)
                box.input = this;
                box.type = "output";
                canvas.add(box)
                return box;
            },
            newLegend           : function (items) {
                var count = _.size(items)
                if (count === 0)
                    return;

                var rowheight = 30
                var canvas = this.canvas
                var height = count * rowheight
                var width = 160

                var x = canvas.width - width / 2 - 30 - ((10+width)*this.legends)
                var y = 0 + height / 2 + 5//canvas.height - height / 2
                var options = {width : width, height : height, top : y, left : x, fill : "#f4faf5"}
                var box = new fabric.Rect(options);
                var top = new fabric.Rect({width : width, height : 3, top : 1.5, left : x, fill : "rgb(43, 166, 203)"})
                this.lock(box)
                canvas.add(box)
                canvas.add(top)
                var index = 0;
                _.each(items, function (item) {
                    var i = index;
                    var color = item.color;
                    var name = item.name;
                    var iheight = 20
                    var iwidth = 20
                    var c = y - height / 2 + i * rowheight + rowheight / 2
                    var d = x - width / 2 + 10 + iwidth / 2
                    var lb = new fabric.Rect({
                        width  : iwidth,
                        height : iheight,
                        fill   : color,
                        stroke : 0,
                        top    : c,
                        left   : d })
                    this.lock(lb)
                    canvas.add(lb)

                    var text = new fabric.Text(name, {
                        top        : c,
                        left       : d + 15,
                        fontSize   : 16,
                        lineHeight : 1,
                        fontFamily : 'Helvetica'})
                    canvas.add(text)
                    this.lock(text)
                    text.left = text.left + (text.width / 2)
                    canvas.renderAll()
                    index++;
                }, this)
            this.legends += 1;
            },
            fullScreen          : function () {
                this.full = true
                var canvas = this.canvas;
                var h = window.screen.height
                var w = window.screen.width
                canvas.setHeight(h);
                canvas.setWidth(w);
                if (this.onResize)
                    this.onResize(h, w)
            },
            cancelFullScreen    : function () {
                this.full = false
                this.resize()
            },
            resize              : function () {
                if (!this.full) {
                    var canvas = this.canvas;
                    var h = Math.max(200, ($(window).height() * this.maxHeightPercentage) - 145, $("#editorInfo").height());
                    var w = $(window).width() > 999 ? $(window).width() * 9 / 12 - 30 : $(window).width() - 30;
                    canvas.setHeight(h);
                    canvas.setWidth(w);
                    if (this.onResize)
                        this.onResize(h, w)
                }
            },
            createGUID          : function () {
                //Snippet to generate a guid from http://stackoverflow.com/a/2117523. Any code with a very high probability of no collisions would work here. I'm surprised Javascript doesn't have generation of GUIDs as a built in function
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            hide                : function () {
                this.$el.parent().hide();
            },
            show                : function () {
                this.$el.parent().show();
                this.resize()
            },
            remove              : function () {
                this.hide();
            }, getColor         : function (t) {
                return getColor({type : {type : t}})
            }, lock             : function (box) {
                box.hasControls = box.hasBorders = false;
                box.lockMovementX = box.lockMovementY = true;
            }
        }
    }

})
;