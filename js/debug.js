//This gives us access to the variable primitives, the array of primitive functions
importScripts('data/primitives.js', 'libs/lodash.min.js')

var resultCaching = true
var env
var localFunctions
var LocalFunctionsFresh
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

onmessage = function (event) {
    if ("main" in event.data) {
        env = newEnv(event.data.localFunctions[event.data.main], event.data.inputs, event.data.main);
        localFunctions = event.data.localFunctions
        LocalFunctionsFresh = _.clone(localFunctions, true)
    } else if ("step" in event.data) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            if (env.stack.length !== 0) {
                step(env)
                debug(env)
            } else {
                success(env.returnVal);
            }
        }
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

function debug(env) {
    self.postMessage({debug : debugArray(env.stack[env.stack.length - 1])})
}

function debugArray(env) {
    if (env !== undefined) {
        var a = debugArray(env.callee)
        env.editor.name = env.name;
        a.push(env.editor)
        return a
    } else {
        return []
    }
}

function newEnv(editor, inputs, name) {
    if (editor.output === undefined)
        fail("No function wired to output")
    else
        return {
            stack : [
                //TODO: Check if editor.functions[editor.output] exists, otherwise use "i" mode
                {func : editor.functions[editor.output], action : "e", inputs : inputs, editor : editor, name : name}
            ]
        }
}

function step(env) {
    var ft = env.stack.pop();
    switch (ft.action) {
        case "e" :
            //Check cache for a result to the ft.func call, if not found, pass the 'real' implemented function on to the "r" action to run
            if (resultCaching && "result" in ft.func && ft.func.result !== undefined) {
                env.returnVal = ft.func.result
            } else {
                ft.func.active = true
                ft.func.result = undefined;
                if (ft.func.function in prims) {
                    var functionToApply;
                    if (ft.func.arg !== undefined) {
                        functionToApply = prims[ft.func.function].new(ft.func.arg)
                    } else {
                        functionToApply = prims[ft.func.function]
                    }
                    var response = functionToApply.apply
                    env.stack.push({func : ft.func, action : "r", cont : function () {return response.apply()}, inputs : ft.inputs, editor : ft.editor, callee : ft.callee, name : ft.name})
                } else if (ft.func.function in localFunctions) {
                    var editor = _.clone(LocalFunctionsFresh[ft.func.function], true)
                    env.stack.push({func : editor.functions[editor.output], action : "e", editor : editor, callee : ft, name : ft.func.function})
                }
            }
            break
        case "r":
            //Run the function in ft.cont, then respond according to the need
            if (typeof inp !== "undefined")
                inp.responded = true;
            var response = ft.cont(env.returnVal)
            if ("result" in response) {
                if ("debug" in response) {
                    log(response.debug + " result was " + response.result)
                }
                ft.func.result = response.result;
                ft.func.active = false
                env.returnVal = ft.func.result
            } else {
                if (response.need in ft.func.inputs) {
                    var inp = ft.func.inputs[response.need]
                    env.stack.push({func : ft.func, action : "r", cont : response.cont, using : inp, inputs : ft.inputs, editor : ft.editor, callee : ft.callee, name : ft.name})
                    inp.requested = true
                    if (inp.wired in ft.editor.functions)
                        env.stack.push({func : ft.editor.functions[inp.wired], action : "e", inputs : ft.inputs, editor : ft.editor, callee : ft.callee, name:ft.name})
                    else
                        env.stack.push({input : inp.wired, action : "i", inputs : ft.inputs, editor : ft.editor, callee : ft.callee, name : ft.name})
                } else {
                    fail("Unwired function exception")
                }
            }
            break
        case "i":
            if (typeof ft.inputs !== "undefined") {
                env.returnVal = ft.inputs[ft.input]
            } else {
                var inp = ft.callee.func.inputs[ft.input]
                if (inp.wired in ft.callee.editor.functions)
                    env.stack.push({func : ft.callee.editor.functions[inp.wired], action : "e", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
                else
                    env.stack.push({input : inp.wired, action : "i", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name})
            }
            break
    }
}



