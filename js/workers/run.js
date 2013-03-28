//This gives us access to the variable primitives, the array of primitive functions
importScripts('../data/primitives.js', '../libs/lodash.min.js')

var localFunctions
var prims = _.reduce(primitives, function (prims, prim) {
    prims[prim.name] = prim
    return prims
}, {})

function log(data) {
    self.postMessage({log : data})
}

function success(result) {
    self.postMessage({result : result})
}

function fail(reason) {
    self.postMessage({fail : reason})
}

onmessage = function (event) {
    if ("main" in event.data) {
        localFunctions = event.data.localFunctions
        var mainMethod = event.data.main
        var editor = _.clone(event.data.localFunctions[mainMethod], true)
        var inputs = event.data.inputs
        var func = editor.functions[editor.output];
        if (editor.output === undefined)
            return fail("No function wired to output")
        else {
            try {
                if (typeof func === "undefined") {
                    success(input({inputs : inputs, editor : editor, input : editor.output}))
                } else {
                    success(eval({func : func, inputs : inputs, editor : editor, name : mainMethod}))
                }
            } catch (e) {
                if (e instanceof RangeError)
                    return fail("Maximum stack size exceeded, please check your function definitions in debug mode")
                else
                    throw e
            }
        }
    } else {
        fail("No instruction given to worker")
    }
}

function eval(ft) {
    if ("result" in ft.func && ft.func.result !== undefined) {
        return ft.func.result
    } else {
        if (ft.func.function in localFunctions) {
            var editor = _.clone(localFunctions[ft.func.function], true)
            var func = editor.functions[editor.output]
            if (func === undefined)
                return input({input : editor.output, editor : editor, callee : ft, name : ft.func.function})
            else
                return eval({func : func, editor : editor, callee : ft, name : ft.func.function})
        } else if (ft.func.function in prims) {
            var functionToApply;
            if (ft.func.arg !== undefined) {
                functionToApply = prims[ft.func.function].new(ft.func.arg)
            } else {
                functionToApply = prims[ft.func.function]
            }
            return cont(e(ft, {cont : function () {return functionToApply.apply()}}))
        } else {
            return fail("Function "+ ft.func.function + " not found locally or as a primitive");
        }
    }
}

function cont(ft, retVal) {
    var response = ft.cont(retVal)
    if ("result" in response) {
        if ("func" in ft)
            ft.func.result = response.result
        return response.result
    } else {
        if (response.need in ft.func.inputs) {
            var inp = ft.func.inputs[response.need]
            var ar;
            if (inp.wired in ft.editor.functions)
                ar = eval(e(ft, {func : ft.editor.functions[inp.wired]}))
            else
                ar = input(e(ft, {input : inp.wired}))
            return cont(e(ft, {cont : response.cont}), ar)
        } else {
            return fail("Unwired argument '" + response.need + "' on function '" + ft.func.function + "'")
        }
    }
}

function input(ft) {
    if (typeof ft.inputs !== "undefined") {
        return ft.inputs[ft.input]
    } else {
        var inp = ft.callee.func.inputs[ft.input]
        var ar;
        if (inp.wired in ft.callee.editor.functions)
            ar = eval({func : ft.callee.editor.functions[inp.wired], editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
        else
            ar = input({input : inp.wired, editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
        //TODO: Store in the ft.inputs array as caching.
        return ar
    }
}

function e(ft, extra) {
    return _.extend({}, ft, extra);
}

