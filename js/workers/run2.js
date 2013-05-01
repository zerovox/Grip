//This gives us access to the variable primitives, the array of primitive functions
importScripts('../data/primitives.js', '../libs/lodash.min.js')

var env
var localFunctions
var prims = _.reduce(primitives, function (memo, prim) {
    memo[prim.name] = prim
    return memo;
}, {})

onmessage = function (event) {
    if ("main" in event.data) {
        localFunctions = event.data.localFunctions
        env = newEnv(_.clone(event.data.localFunctions[event.data.main], true), event.data.inputs, event.data.main);
        while (env.stack.length !== 0) {
            step(env)
        }
        success(env.returnVal);
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
    editor.outputDebug = {}
    if (editor.output === undefined)
        fail("No function wired to output")
    else
        var func = editor.functions[editor.output]
    if (func === undefined)
        return {stack : [
            {action : "i", inputs : inputs, editor : editor, name : name, input : editor.output}
        ]}
    else
        return {stack : [
            {func : func, action : "e", inputs : inputs, editor : editor, name : name}
        ]}
}

function step(env) {
    var ft = env.stack.pop();
    switch (ft.action) {
        case "e" :
            if ("result" in ft.func && ft.func.result !== undefined) {
                env.returnVal = ft.func.result
            } else {
                ft.func.result = undefined;
                if (ft.func.function in localFunctions) {
                    var editor = _.clone(localFunctions[ft.func.function], true)
                    env.stack.push(e(ft, {action : "r", cont : function (result) { return {result : result, debug : ft.func.function}}}))
                    var func = editor.functions[editor.output]
                    if (func === undefined)
                        env.stack.push({action : "i", editor : editor, callee : ft, name : ft.func.function, input : editor.output})
                    else
                        env.stack.push({func : func, action : "e", editor : editor, callee : ft, name : ft.func.function})
                } else if (ft.func.function in prims) {
                    var functionToApply;
                    if (ft.func.arg !== undefined) {
                        functionToApply = prims[ft.func.function].new(ft.func.arg)
                    } else {
                        functionToApply = prims[ft.func.function]
                    }
                    var response = functionToApply.apply
                    env.stack.push(e(ft, {action : "r", cont : function () {return response()}}))
                }
            }
            break
        case "r":
            var response = ft.cont(env.returnVal)
            if ("result" in response) {
                env.returnVal = response.result
                if ("func" in ft)
                    ft.func.result = env.returnVal

            } else if ("fail" in response) {
                fail(response.fail + " on function '" + ft.func.function + "'")
            } else {
                if (response.need in ft.func.inputs && "wired" in ft.func.inputs[response.need]) {
                    var inp = ft.func.inputs[response.need]
                    env.stack.push(e(ft, {action : "r", cont : response.cont}))
                    if (inp.wired in ft.editor.functions) {
                        env.stack.push(e(ft, {action : "e", func : ft.editor.functions[inp.wired]}))
                    } else
                        env.stack.push(e(ft, {action : "i", input : inp.wired}))
                } else {
                    fail("Unwired argument '" + response.need + "' on function '" + ft.func.function + "'")
                }
            }
            break
        case "i":
            if (typeof ft.inputs !== "undefined") {
                env.returnVal = ft.inputs[ft.input]
            } else {
                var inp = ft.callee.func.inputs[ft.input]
                env.stack.push(e(ft, {action : "r", cont : function (result) { return {result : result}}}))
                if (inp.wired in ft.callee.editor.functions)
                    env.stack.push({func : ft.callee.editor.functions[inp.wired], action : "e", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
                else
                    env.stack.push({input : inp.wired, action : "i", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
            }
            break
    }
}

function e(ft, extra) {
    return _.extend({}, ft, extra);
}
