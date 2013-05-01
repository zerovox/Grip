define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({
        initialize       : function (editor, prims, editors) {
            this.set({tests : new TestCollection(editor.tests, this)})
            if (editor.map === undefined)
                editor.map = {}
            if (editor.map.functions === undefined)
                editor.map.functions = {}
            if (editor.map.inputs === undefined)
                editor.map.inputs = {}
            _.map(editor.map.inputs, function(inp, name){
                var p = {type : "local", name : name}
                inp["infType"] = p
                return inp;
            })

            this.set("map", editor.map)
            this.prims = prims;
            this.output = {}
            this.output.infType = {type : "local", name : editor.name};
            this.editors = editors;
            this.inputs = editor.map.inputs;

            this._fixTypes();

            this.listenTo(this.get("tests"), "change", _.bind(this.trigger, this, "change"))
        },
        passesTests : function (){
          return this.get("tests").allTestsPassed()
        },
        addFunction      : function (model) {
            this.get("map").functions[model.name] = model;
            this._infTypes()
        },
        removeFunction   : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            _.each(this.get("map").functions, function (func) {
                _.each(func.inputs, function (input) {
                    if ("wired" in input && input.wired == name)
                        delete input.wired;
                })
            })
            delete this.get("map").functions[name]
            this._infTypes()
        },
        addInput         : function (name) {
            if (name in this.get("map").inputs || name in this.get("map").functions) {
                return false
            } else {
                this.get("map").inputs[name] = {}
                return true
            }
            this._infTypes()
        },
        linkOutput       : function (name) {
            this.get("map").output = name
            this._infTypes()
        },
        linkInput        : function (functionName, functionInput, linkTo) {
            this.get("map").functions[functionName].inputs[functionInput] = {wired : linkTo}
            this._infTypes()
        },
        move             : function (name, x, y) {
            this.get("map").functions[name].x = x
            this.get("map").functions[name].y = y
        }, removeInput   : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").inputs[name]
            this._infTypes()
        }, toHaskell     : function (prims) {
            var equ = _.reduce(this.get("map").inputs, function (memo, input, name) {
                return memo + " " + name
            }, this.get("name").replace(" ", ""))
            return equ + " = " + this._toHaskell(this.get("map").output, prims)
        }, _toHaskell    : function (name) {
            if (name in this.get("map").functions) {
                var func = this.get("map").functions[name]
                var ins = _.reduce(func.inputs, function (result, value, key) {
                    result[key] = this._toHaskell(value.wired);
                    return result;
                }, {}, this)
                var prim = this._getPrim(func.function)
                if (typeof prim === "undefined")
                    return "(" + func.function + _.reduce(ins, function (memo, value, key) {return memo + " " + value}, "", this) + ")"
                else
                    return prim.get("func").toHaskell(ins, func.arg)
            }

            return name ? name.replace(" ", "") : name;
        }, _getPrim      : function (name) {
            return this.prims.find(function (model) { return model.get("func").name === name})
        }, _getLocal     : function (name) {
            return this.editors.find(function (func) {
                return (func.get("name") === name)
            });
        }, _clearInf     : function () {
            _.forEach(this.get("map").functions, function (func) {
                _.forEach(func.inputs, function (input) {
                    delete input.infType
                })
                delete func.output
            })
        }, _clearInfTemp : function () {
            _.forEach(this.get("map").functions, function (func) {
                delete func.inf;
            })
        }, _infTypes     : function () {
            this._clearInf()
            this.output.infType = this._getType(this.get("map").output) || this.output.infType
            this._clearInfTemp()

            _.forEach(this.get("map").functions, function (func, name) {
                if (typeof (func.output) === "undefined" || typeof func.output.infType === "undefined") {
                    this._getType(name)
                    this._clearInfTemp()
                }
            }, this)
            //Now we have inferred some types, we fix these in place so we can use this function to infer more types
            this._fixTypes();
        }, _fixTypes : function(){
            this.output.type = this.output.infType
            _.forEach(this.inputs, function (input, name) {
                input.type = input.infType;
            })
        }, _getType      : function (name, expected) {
            if (typeof name === "undefined")
                return undefined
            //TODO: Handle inputs
            var func = this.get("map").functions[name]
            if (typeof func === "undefined") {
                var input = this.get("map").inputs[name]
                if ("infType" in input && input.infType.type !== "local") {
                    if (typeof expected !== "undefined" && expected.type !== "local")
                        console.log("Type mismatch for input " + name + " between " + input.infType.type + " and " + expected.type)
                    return input.infType
                }
                if (typeof expected !== "undefined")
                    input.infType = expected
                else
                    input.infType = {type : "local", name : name}
                return input.infType
            }

            if ("inf" in func) {
                console.log("Type loop detected")
                return undefined
            } else {
                func.inf = true;
            }

            var localtypes = {}
            var stack = []
            var undecided = []
            var prim = this._getPrim(func.function);

            var p;

            //TODO: Case for non-prim
            if (typeof prim === "undefined") {
                var p = this._getLocal(func.function)
                // p._infTypes() // Will get us into loops
            } else {
                p = prim.get("func");
            }
            if (typeof expected !== "undefined" && p.output.type.type === "local")
                localtypes[p.output.type.name] = expected

            _.forEach(p.inputs, function (t, name) {
                if (!(name in func.inputs))
                    func.inputs[name] = {}
                stack.push({attrs : func.inputs[name], name : name})
            })

            while (stack.length !== 0) {
                var input = stack.pop()
                var name = input.name
                var attrs = input.attrs
                var t;
                if (p.inputs[name].type.type === "local") {
                    if (p.inputs[name].type.name in localtypes) {
                        var tp = this._getType(attrs.wired, localtypes[p.inputs[name].type.name])
                        if (localtypes[p.inputs[name].type.name].type === "local" && typeof tp !== "undefined" && tp.type !== "local") {
                            //If we find a 'stronger' type, i.e. a non-local type, we should update all matching type variables to this
                            t = tp
                            _.forEach(p.inputs, function (t, n2) {
                                if (name !== n2 && "type" in t && t.type.type === "local" && t.type.name === p.inputs[n2].type.name) {
                                    stack.push({attrs : func.inputs[n2], name : n2})
                                }
                            })
                            localtypes[p.inputs[name].type.name] = t;
                        } else {
                            t = localtypes[p.inputs[name].type.name]
                        }
                    } else {
                        t = this._getType(attrs.wired)
                        if (typeof t !== "undefined") {
                            localtypes[p.inputs[name].type.name] = t
                            _.forEach(undecided, function (input) {
                                stack.unshift(input)
                            })
                            undecided = []
                        }
                        else
                            undecided.push(input)
                    }
                } else {
                    this._getType(attrs.wired, p.inputs[name].type)
                    t = p.inputs[name].type;
                }
                attrs.infType = t
            }

            if (!("output" in func))
                func.output = {}

            if (p.output.type.type === "local")
                func.output.infType = localtypes[p.output.type.name]
            else
                func.output.infType = p.output.type

            if (typeof expected !== "undefined" && expected !== func.output.infType)
                console.log("Type mismatch!")

            return func.output.infType
        }

    });

});