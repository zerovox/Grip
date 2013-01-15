//This gives us access to the variable primitives, the array of primitive functions
importScripts('data/primitives.js', 'libs/lodash.min.js')

var resultCaching = true
var env;
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

self.onmessage = function (event) {
    if (event.data.editor !== undefined) {
        if (event.data.editor.output === undefined)
            fail("No function wired to output")
        else
            env = newEnv(event.data.editor, event.data.inputs);
    } else if (event.data.step) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            if (env.stack.length !== 0) {
                step(env)
                debug(env.editor)
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

function debug(editor) {
    self.postMessage({debug : editor})
}

function newEnv(editor, inputs) {
    return {
        editor : editor,
        inputs : inputs,
        stack  : [
            {fName : editor.output, action : "e"}
        ]
    }
}

function step(env) {
    var ft = env.stack.pop();
    var f = env.editor.functions[ft.fName];
    if (ft.action === "e") {
        if (f === undefined) {
            env.returnVal = env.inputs[ft.fName];
        } else if (resultCaching && f.result !== undefined) {
            env.returnVal = f.result
        } else {
            f.active = true
            f.result = undefined;
            var response = prims[f.function].apply()
            if (response.result !== undefined) {
                f.result = response.result;
                f.active = false
                env.returnVal = f.result
            } else {
                env.stack.push({fName : ft.fName, action : "r", cont : response.cont})
                var inp = f.inputs[response.need]
                if (inp === undefined) {
                    fail("Unwired function exception")
                } else {
                    env.stack.push({fName : inp.wired, action : "e"})
                }
            }
        }
    } else if (ft.action === "r") {
        var response = ft.cont(env.returnVal)
        if (response.result !== undefined) {
            f.result = response.result;
            f.active = false
            env.returnVal = f.result
        } else {
            env.stack.push({fName : ft.fName, action : "r", cont : response.cont})
            var inp = f.inputs[response.need]
            if (inp === undefined) {
                fail("Unwired function exception")
            } else {
                env.stack.push({fName : inp.wired, action : "e"})
            }
        }
    }
}


