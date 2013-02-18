//This gives us access to the variable primitives, the array of primitive functions
importScripts('../data/primitives.js', '../libs/lodash.min.js')

var resultCaching = true
var localFunctions
var LocalFunctionsFresh
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

onmessage = function (event) {
    if ("main" in event.data) {
        localFunctions = event.data.localFunctions
        LocalFunctionsFresh = _.clone(localFunctions, true)
        success(eval(newEnv(event.data.localFunctions[event.data.main], event.data.inputs, event.data.main)))
    } else {
        fail("No instruction given to worker")
    }
}

function log(data) {
    self.postMessage({log : data})
}

function success(result) {
    self.postMessage({result : result})
}

function fail(reason) {
    self.postMessage({fail : reason})
}

function newEnv(editor, inputs, name) {
    if (editor.output === undefined)
        return fail("No function wired to output")
    else
        return {func : editor.functions[editor.output], inputs : inputs, editor : editor, name : name}

}

function eval(ft) {
    if (resultCaching && "result" in ft.func && ft.func.result !== undefined) {
        return ft.func.result
    } else {
        ft.func.result = undefined;
        if (ft.func.function in prims) {
            var functionToApply;
            if (ft.func.arg !== undefined) {
                functionToApply = prims[ft.func.function].new(ft.func.arg)
            } else {
                functionToApply = prims[ft.func.function]
            }
            var response = functionToApply.apply
            return cont(e(ft, {cont : function () {return response.apply()}}), undefined)
        } else if (ft.func.function in localFunctions) {
            var editor = _.clone(LocalFunctionsFresh[ft.func.function], true)
            return eval({func : editor.functions[editor.output], editor : editor, callee : ft, name : ft.func.function})
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
            if (inp.wired in ft.editor.functions) {
                ar = eval(e(ft, {func : ft.editor.functions[inp.wired]}))
            } else
                ar = input(e(ft, {input : inp.wired}))
            return cont(e(ft, {cont : response.cont}), ar)
        } else {
            return fail("Unwired function exception")
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
        return ar
    }
}

function e(ft, extra) {
    return _.extend({}, ft, extra);
}

