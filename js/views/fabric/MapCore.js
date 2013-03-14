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

    return function () {
        return {
            initialize          : function () {
                var that = this;
                this.full = false;
                //Define a canvas, disable selection
                var canvas = this.canvas = new fabric.Canvas(this.el, {selection : false});
                //Add our window resize triggers
                $(window).resize(function () {
                    that.resize()
                    that.render()
                });
                //Make sure the canvas is the correct size
                this.resize()

                //Record a pointer to the original findTarget method
                this.ft = canvas.findTarget;

                //Call onInit if defined
                if (this.onInit)
                    this.onInit(canvas)
            },
            addFindTargetEvents : function (canvas) {
                //TODO: Adjust find target for fullscreen
                //Piggyback on canvas.findTarget : https://github.com/kangax/fabric.js/wiki/Working-with-events
                canvas.findTarget = (function (originalFn) {
                    return function () {
                        var target = originalFn.apply(this, arguments);
                        //console.log(target, arguments)
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
            },
            render              : function () {
                if (this.beforeRender)
                    this.beforeRender()
                var canvas = this.canvas
                var map = this.editorModel.get("map")
                //Clear the canvas
                canvas.clear()
                //Add find target events
                this.addFindTargetEvents(canvas)
                //Check we have a map to render
                if (typeof map !== "undefined") {

                    //Store an ordered list of functions. Ordering is the same as the original model. Used to wire up the view.
                    var functions = {}
                    //For each function, add to canvas then add to list above.
                    _.each(map.functions, function (func, name) {
                        //Find the 'real' function that corresponds to this functionModel
                        var fullFunction = this.functions.find(function (funcp) {
                            return funcp.get("func").name === func.function;
                        })
                        var ff;
                        if (typeof fullFunction !== "undefined") {
                            //If the function is found, grab the actual function model from the backbone model container
                            func.name = name;
                            if (func.arg !== undefined) {
                                //Instantiate a new copy of the function, like for constants with an argument.
                                ff = fullFunction.get("func")['new'](func.arg);
                            } else {
                                ff = fullFunction.get("func");
                            }
                        } else {
                            //Check for a local function with this name instead
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

                    //Add out inputs to the list of functions. Used to wire up the view.
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

                    //Add the function output to the view and wire it up
                    var out = this.newOutput();
                    if (map.output !== undefined) {
                        this.wireUp(undefined, functions[map.output], out, functions[map.output].output)
                    }
                }
                //Call the render callback if defined
                if (this.onRender)
                    this.onRender()

            },
            wireUp              : function (func, func2, inp, out) {
                var canvas = this.canvas;
                canvas.remove(inp.wire)
                delete inp.wire
                var fill = '#2284A1';

                var wire = new fabric.Path("M" + inp.getLeft() + "," + inp.getTop() + " C" + ((out.getLeft() + inp.getLeft()) / 2) + "," + inp.getTop() + " " + ((out.getLeft() + inp.getLeft()) / 2) + "," + out.getTop() + " " + out.getLeft() + "," + out.getTop(), {
                    fill        : "",
                    strokeWidth : 4,
                    stroke      : fill
                })

                wire.lockMovementX = wire.lockMovementY = true;
                wire.hasBorders = wire.hasControls = false;
                wire.type = "wire"
                inp.wire = wire

                function rewire(inp) {
                    if(typeof inp !== "undefined" && "wire" in inp && inp.wire == wire){
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

                if (func !== undefined) {
                    func.on('moving', function(){rewire(inp)})
                }
                if (func2 !== undefined) {
                    func2.on('moving', function(){rewire(inp)})
                }

                if (this.onWired)
                    this.onWired(inp, out, wire)

                canvas.add(wire)
                rewire(inp)
                return wire;
            },
            newInput            : function (name, x, y) {
                var canvas = this.canvas;
                var height = 40;
                var width = 120
                var options = {top : ((x + 1) / (y + 1)) * (canvas.height) + (height / 2), left : width / 2};
                var box = new Function(name, height, width, options);
                var output = new fabric.Circle({radius : 10, fill : 'rgb(230,230,230)', top : ((x + 1) / (y + 1)) * (canvas.height) + (height / 2), left : width, stroke : 1})

                box.hasControls = box.hasBorders = output.hasControls = output.hasBorders = false;
                box.lockMovementX = box.lockMovementY = output.lockMovementX = output.lockMovementY = true;
                output.type = "functionOutput";
                output.func = box;
                box.output = output;
                box.inputName = name;
                box.type = "functionInput"
                canvas.add(box)
                canvas.add(output)

                if (this.onNewInput)
                    this.onNewInput(name, box)
                return box;
            },
            newFunction         : function (funcReal, func) {
                var canvas = this.canvas;
                var height = Math.max(40, 40 * funcReal.inputs.length);
                var width = 140
                var options = {top : func.y, left : func.x};
                var box = new Function(funcReal.name, height, width, options, func.arg);
                box.hasControls = box.hasBorders = false;
                canvas.add(box)

                box.inputs = {}
                _.each(funcReal.inputs, function (name, index) {
                    var input = new fabric.Circle({radius : 10, fill : 'rgb(230,230,230)', stroke : 1})
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

                var output = new fabric.Circle({radius : 10, fill : 'rgb(230,230,230)', stroke : 1})
                output.hasControls = output.hasBorders = false;
                output.lockMovementX = output.lockMovementY = true;

                output.type = "functionOutput";
                output.func = box;
                box.output = output;

                function positionOutput(box) {
                    output.setTop(box.getTop()).setCoords();
                    output.setLeft(box.getLeft() + width / 2).setCoords();
                    output.render(canvas.getContext())
                }

                box.on('moving', function () {
                    positionOutput(box)
                })

                box.type = "function"

                if (this.onNewFunction)
                    this.onNewFunction(funcReal, func, box)

                canvas.add(output)
                positionOutput(box);

                return box;
            },
            newOutput           : function () {
                var canvas = this.canvas;
                var box = new fabric.Circle({radius : 30, fill : 'rgb(230,230,230)', top : (canvas.height / 2), left : canvas.width, stroke : 1})

                box.hasControls = box.hasBorders = false;
                box.lockMovementX = box.lockMovementY = true;
                box.input = this;
                box.type = "output";
                canvas.add(box)
                return box;
            },
            fullScreen          : function () {
                this.full = true
                var canvas = this.canvas;
                var h = window.screen.height
                var w = window.screen.width
                console.log(h, w)
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
                    var h = Math.max(200, ($(window).height() - 100) * this.maxHeightPercentage);
                    var w = $(window).width() > 999 ? $(window).width() * 10 / 12 - 30 : $(window).width() - 30;
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
            }, hide             : function () {
                this.$el.parent().hide();
            }, show             : function () {
                this.$el.parent().show();
            }, remove : function(){
                this.hide();
            }
        }
    }

});