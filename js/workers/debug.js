//This gives us access to the variable primitives, the array of primitive functions
importScripts('../data/primitives.js', '../libs/lodash.min.js')

var env
var localFunctions
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

onmessage = function (event) {
    if ("main" in event.data) {
        localFunctions = event.data.localFunctions
        env = newEnv(_.clone(event.data.localFunctions[event.data.main], true), event.data.inputs, event.data.main);
        debug(env)
    } else if ("step" in event.data) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            if (env.stack.length !== 0) {
                step(env)
                debugState(env.previousState)
            } else {
                success(env.returnVal);
                //Final debug view, show the previous state
                debugState(env.previousState)
            }
        }
    } else if ("stepOver" in event.data) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            if (env.stack.length !== 0) {
                var temp = env.stack.pop()
                env.stack.push({action : "o"})
                env.stack.push(temp)
                while (step(env)) {}
                debugState(env.previousState)
            } else {
                success(env.returnVal);
                //Final debug view, show the previous state
                debugState(env.previousState)
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

function debugState(state) {
    self.postMessage({debug : debugArray(state)})
}

function debug(env) {
    self.postMessage({debug : debugArray(env.stack[env.stack.length - 1])})
}

function debugArray(env) {
    if (env !== undefined) {
        var a = debugArray(env.callee)
        if (env.editor)
            env.editor.name = env.name;
        a.push(env.editor)
        return a
    } else {
        return []
    }
}

function newEnv(editor, inputs, name) {
    editor.outputDebug = {}
    if (editor.output === undefined)
        fail("No function wired to output")
    else
        var func = editor.functions[editor.output]
    if (func === undefined)
        return {stack : [
            {action : "i", inputs : inputs, editor : editor, name : name, using : editor.outputDebug, input : editor.output}
        ]}
    else
        return {stack : [
            {func : func, action : "e", inputs : inputs, editor : editor, name : name, using : editor.outputDebug}
        ]}
}

function step(env) {
    var ft = env.stack.pop();
    switch (ft.action) {
        case "e" :
            //Check cache for a result to the ft.func call, if not found, pass the 'real' implemented function on to the "r" action to run
            if ("result" in ft.func && ft.func.result !== undefined) {
                env.returnVal = ft.func.result
                ft.using.result = env.returnVal
                ft.using.responded = true
            } else {
                ft.func.result = undefined;
                if (ft.func.function in localFunctions) {
                    var editor = _.clone(localFunctions[ft.func.function], true)
                    ft.func.envEditor = editor;
                    editor.name = ft.func.function
                    env.stack.push(e(ft, {action : "r", cont : function (result) { return {result : result, debug : ft.func.function}}}))
                    //We don't use the extend here, as we want to create a fresh stack frame
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
                    env.stack.push(e(ft, {action : "r", cont : function () {return response.apply()}}))
                }
            }
            break
        case "r":
            //Run the function in ft.cont, then respond according to the need
            var response = ft.cont(env.returnVal)
            if ("result" in response) {
                env.returnVal = response.result
                if ("debug" in response && "func" in ft) {
                    var str = response.debug + " result was " + response.result
                    ft.func.debugString = str
                }
                if ("func" in ft)
                    ft.func.result = env.returnVal
                if ("using" in ft) {
                    ft.using.result = env.returnVal
                    ft.using.responded = true
                }
            } else if ("fail" in response) {
                fail("Primitive function error:'" + response.fail + "' on function '" + ft.func.function + "'")
            } else {
                if (response.need in ft.func.inputs) {
                    var inp = ft.func.inputs[response.need]
                    env.stack.push(e(ft, {action : "r", cont : response.cont}))
                    inp.requested = true
                    if (inp.wired in ft.editor.functions) {
                        env.stack.push(e(ft, {action : "e", func : ft.editor.functions[inp.wired], using : inp}))
                    } else
                        env.stack.push(e(ft, {action : "i", input : inp.wired, using : inp}))
                } else {
                    fail("Unwired argument '" + response.need + "' on function '" + ft.func.function + "'")
                }
            }
            break
        case "i":
            log("Requesting input " + ft.input + " from " + ft.inputs)
            if (typeof ft.inputs !== "undefined") {
                env.returnVal = ft.inputs[ft.input]
                ft.using.result = env.returnVal
                ft.using.responded = true
            } else {
                var inp = ft.callee.func.inputs[ft.input]
                inp.requested = true
                env.stack.push(e(ft, {action : "r", cont : function (result) { return {result : result}}}))
                if (inp.wired in ft.callee.editor.functions)
                    env.stack.push({func : ft.callee.editor.functions[inp.wired], action : "e", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name, using : inp})
                else
                    env.stack.push({input : inp.wired, action : "i", editor : ft.callee.editor, callee : ft.callee.callee, inputs : ft.callee.inputs, name : ft.name, using : inp})
            }
            break
        case "o":
            return false
    }
    env.previousState = ft
    return true
}

function e(ft, extra) {
    return _.extend({}, ft, extra);
}
