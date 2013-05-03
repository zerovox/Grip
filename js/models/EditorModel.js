define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({
        initialize     : function (editor, prims, editors) {
            this.set({tests : new TestCollection(editor.tests, this)})
            if (editor.map === undefined)
                editor.map = {}
            if (editor.map.functions === undefined)
                editor.map.functions = {}
            if (editor.map.inputs === undefined)
                editor.map.inputs = {}

            this.set("map", editor.map)
            this.prims = prims;
            this.output = {}
            this.editors = editors;
            this.inputs = editor.map.inputs;

            this._clearInf()
            this._fixTypes()

            this.listenTo(this.get("tests"), "change", _.bind(this.trigger, this, "change"))
        },
        passesTests    : function () {
            return this.get("tests").allTestsPassed()
        },
        addFunction    : function (model) {
            this.get("map").functions[model.name] = model;
            this._infTypes()
        },
        removeFunction : function (name) {
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
        addInput       : function (name) {
            if (name in this.get("map").inputs || name in this.get("map").functions) {
                return false
            } else {
                this.get("map").inputs[name] = {}
                this._infTypes()
                return true
            }
        },
        linkOutput     : function (name) {
            this.get("map").output = name
            this._infTypes()
        },
        linkInput      : function (functionName, functionInput, linkTo) {
            this.get("map").functions[functionName].inputs[functionInput] = {wired : linkTo}
            this._infTypes()
        },
        move           : function (name, x, y) {
            this.get("map").functions[name].x = x
            this.get("map").functions[name].y = y
        }, removeInput : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").inputs[name]
            this._infTypes()
        }, toHaskell   : function (prims) {
            var equ = _.reduce(this.get("map").inputs, function (memo, input, name) {
                return memo + " " + name
            }, this.get("name").replace(" ", ""))
            return equ + " = " + this._toHaskell(this.get("map").output, prims)
        }, _toHaskell  : function (name) {
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
        }, _getPrim    : function (name) {
            return this.prims.find(function (model) { return model.get("func").name === name})
        }, _getLocal   : function (name) {
            return this.editors.find(function (func) {
                return (func.get("name") === name)
            });
        }, _getPrimOrLocal : function(name){
            var prim = this._getPrim(name);
            if(typeof prim === "undefined")
                prim = this._getLocal(name)
            else
                prim = prim.get("func")
            return prim
        }, _clearInf   : function () {
            _.map(this.get("map").inputs, function (inp, name) {
                inp["infType"] = {type : "local", name : name}
                return inp;
            })
            this.output.infType = {type : "local", name : this.get("name")};
        }, _infTypes   : function () {
            this._clearInf()
            //Create new type variable for each function+input combo
            var typeVars = _.reduce(this.get("map").functions, function (memo, attrs, name) {
                var funcTVs = []
                var locals = {}

                function procType(type, id) {
                    if (type.type == "local") {
                        //If two function inputs, or the function output, has the same type, unify these.
                        if (type.name in locals)
                            locals[type.name].push(id)
                        else
                            locals[type.name] = [id]
                    } else {
                        //If any input/output has a concrete type, attach this type to the type variable too
                        funcTVs.push(typeVar([id], [type.type]))
                    }
                }

                var prim = this._getPrimOrLocal(attrs.function)

                _.each(prim.inputs, function (attrs, inName) {
                    procType(attrs.type, "func:" + name + " in:" + inName)
                })

                procType(prim.output.type, name)

                _.each(locals, function (ids, localName) {
                    funcTVs.push(typeVar(ids, []))
                })

                return memo.concat(funcTVs);
            }, [], this)

            //Create type var for each input
            typeVars = _.reduce(this.get("map").inputs, function (memo, attrs, name) {
                memo.push(typeVar([name], []))
                return memo
            }, typeVars, this)

            //Create type var for the output
            typeVars.push(typeVar(["out"], []))
            //For each wire, unify the type variables, check their concrete types match, if not report untypable, but continue
            _.each(this.get("map").functions, function (attrs, name) {
                _.each(attrs.inputs, function (inAttrs, inName) {
                    if ("wired" in inAttrs) {
                        var id1 = "func:" + name + " in:" + inName;
                        var id2 = inAttrs.wired;
                        typeVars = unify(id1, id2, typeVars)
                    }
                })
            }, this)

            if ("output" in this.get("map"))
                typeVars = unify("out", this.get("map").output, typeVars)

            //For each type variable remaining
            _.each(typeVars, function (typeVar) {
                if (_.size(typeVar.types) === 0) {
                    //If no types, we have a variable type, so pick a unique name to cover everything with the id
                    typeVar.type = {type : "local", name : _.first(typeVar.ids)}
                } else if (_.size(typeVar.types) === 1) {
                    //If there is one concrete type, take this as the type.
                    typeVar.type = {type : _.first(typeVar.types)}
                } else {
                    //If multiple possible types, we can't satisfy this type variable
                    //This means two incompatible types were connected with a wire
                    console.log("Type Error, multiple candidate types for a type variable")
                    //We remember that there was an error, allowing us to fall back on primitive types where possible
                    typeVar.error = true;
                }
            })

            //We can now reiterate over all functions and inputs, and give them their corresponding inferred types
            _.each(this.get("map").functions, function (attrs, name) {
                var prim = this._getPrimOrLocal(attrs.function)

                _.each(prim.inputs, function (primAttrs, inName) {
                    var id = "func:" + name + " in:" + inName
                    var type = findType(typeVars, id)
                    if (!(inName in attrs.inputs))
                        attrs.inputs[inName] = {}

                    if (typeof type === "undefined")
                        attrs.inputs[inName].infType = primAttrs.type
                    else
                        attrs.inputs[inName].infType = type
                })

                var outType = findType(typeVars, name)
                if(!("output" in attrs))
                    attrs.output = {}
                if(typeof outType === "undefined")
                    attrs.output.infType = prim.output.type
                else
                    attrs.output.infType = outType

            }, this)

            //And iterate over inputs to give these types
            _.each(this.get("map").inputs, function (attrs, name) {
                var type = findType(typeVars, name)

                if (typeof type === "undefined")
                    attrs.infType = {type : "local", name : name}
                else
                    attrs.infType = type
            }, this)

            //And type the output
            var outType = findType(typeVars, "out")
            if (typeof outType === "undefined")
                this.output.infType = {type : "local", name : this.get("name")};
            else
                this.output.infType = outType

            //Now we have inferred (some) types, we fix these in place so we can use this function to infer types recursively.
            this._fixTypes();
        }, _fixTypes   : function () {
            this.output.type = this.output.infType
            _.forEach(this.inputs, function (input) {
                input.type = input.infType;
            })
        }

    });

    function typeVar(ids, types) {
        return {ids : ids, types : types}
    }

    function unify(id1, id2, typeVars) {
        var id1G, id2G;
        _.each(typeVars, function (vars, index) {
            if (typeof id1G === "undefined" && _.contains(vars.ids, id1))
                id1G = vars;
            if (typeof id2G === "undefined" && _.contains(vars.ids, id2))
                id2G = vars;
        })

        if (typeof id1G === "undefined" || typeof id2G === "undefined") {
            console.log("Error in typing, id not found")
            return false;
        }

        var newTV = typeVar(_.union(id1G.ids, id2G.ids), _.union(id1G.types, id2G.types))
        typeVars = _.without(typeVars, id1G, id2G)
        typeVars.push(newTV)
        return typeVars
    }

    function findType(typeVars, id) {
        var type;
        _.each(typeVars, function (vars) {
            if (typeof type === "undefined" && _.contains(vars.ids, id))
                type = vars.type;
        })
        return type;
    }

});