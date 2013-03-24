define([
    'backbone',
    'collections/Tests'
], function (Backbone, TestCollection) {

    return Backbone.Model.extend({
        initialize     : function (editor) {
            this.set({tests : new TestCollection(editor.tests, this)})
            if (editor.map === undefined)
                editor.map = {}
            if (editor.map.functions === undefined)
                editor.map.functions = {}
            if (editor.map.inputs === undefined)
                editor.map.inputs = {}
            this.set("map", editor.map)
        },
        addFunction    : function (model) {
            this.get("map").functions[model.name] = model;
        },
        removeFunction : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").functions[name]
        },
        addInput       : function (name) {
            if (name in this.get("map").inputs || name in this.get("map").functions) {
                return false
            } else {
                this.get("map").inputs[name] = {}
                return true
            }
        },
        linkOutput     : function (name) {
            this.get("map").output = name
        },
        linkInput      : function (functionName, functionInput, linkTo) {
            this.get("map").functions[functionName].inputs[functionInput] = {wired : linkTo}
        },
        move           : function (name, x, y) {
            this.get("map").functions[name].x = x
            this.get("map").functions[name].y = y
        }, removeInput : function (name) {
            if (this.get("map").output === name)
                delete this.get("map").output
            delete this.get("map").inputs[name]
        }, toHaskell   : function (prims) {
            var equ = _.reduce(this.get("map").inputs, function (memo, input, name) {
                return memo + " " + name
            }, this.get("name").replace(" ",""))
            return equ + " = " + this._toHaskell(this.get("map").output, prims)
        }, _toHaskell  : function (name, prims) {
            if (name in this.get("map").functions) {
                var func = this.get("map").functions[name]
                var ins = _.reduce(func.inputs, function (result, value, key) {
                    result[key] = this._toHaskell(value.wired, prims);
                    return result;
                }, {}, this)
                var prim = prims.find(function (model) { return model.get("func").name === func.function})
                if(typeof prim === "undefined")
                    return "(" + func.function + _.reduce(ins, function(memo, value, key){return memo + " " + value}, "", this) + ")"
                else
                    return prim.get("func").toHaskell(ins, func.arg)
            }

            return name ? name.replace(" ","") : name;
        }

    });

});