//This gives us access to the variable primitives, the array of primitive functions
importScripts('data/primitives.js', 'libs/lodash.min.js')

var resultCaching = true
var env;
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

self.onmessage = function (event) {
    if (event.data.main) {
        env = newEnv(event.data.localFunctions[event.data.main], event.data.inputs);
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
    } else if (event.data.input) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            env.returnVal = event.data.value
        }
    } else if (event.data.need) {
        //TODO: Our currently active child wants an input provided by us.
    } else if (event.data.log !== undefined) {
        log(event.data.log)
    } else if (event.data.result !== undefined) {
        var ft = env.stack.pop()
        if (ft.action === "w") {
            env.returnVal = result.data.result
        } else {
            debug(env.editor)
            fail("Current action was not waiting on a sub-process result, but one was returned. Result was:" + result.data.result)
        }
    } else if (event.data.fail !== undefined) {
        fail(event.data.fail)
    } else if (event.data.debug !== undefined) {
        //TODO: Append our own debug data in some way
        debug(event.data.debug)
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

function requestInput(name) {
    self.postMessage({need : name})
}

function newEnv(editor, inputs) {
    if (editor.output === undefined)
        fail("No function wired to output")
    else
        return {
            editor : editor,
            inputs : inputs,
            stack  : [
                //TODO: Check if editor.outut is a map, if so dont do an "e"
                {fName : editor.output, action : "e"}
            ]
        }
}

//TODO: Get rid of fName, look up function before hand, if not function delegate to different action corresponding to what it is
function step(env) {
    var ft = env.stack.pop();
    var f = env.editor.functions[ft.fName];
    if (ft.action === "e") {
        if (f === undefined) {
            requestInput(ft.fName)
        } else if (resultCaching && f.result !== undefined) {
            env.returnVal = f.result
        } else {
            f.active = true
            f.result = undefined;
            var functionToApply;
            if (f.arg !== undefined) {
                functionToApply = prims[f.function].new(f.arg)
            } else {
                functionToApply = prims[f.function]
            }
            var response = functionToApply.apply
            env.stack.push({fName : ft.fName, action : "r", cont : function () {return response.apply()}})
        }
    } else if (ft.action === "r") {
        //TODO: if using is set, mark f.inputs[using] as request fulfilled
        var response = ft.cont(env.returnVal)
        if (response.result !== undefined) {
            f.result = response.result;
            f.active = false
            env.returnVal = f.result
        } else {
            env.stack.push({fName : ft.fName, action : "r", cont : response.cont, using : response.need})
            var inp = f.inputs[response.need]
            if (inp !== undefined) {
                //TODO: mark inp as requested.
                //TODO: check if fName is a map not a name, in that case dont use action "e"
                env.stack.push({fName : inp.wired, action : "e"})
            } else {
                fail("Unwired function exception")
            }
        }
    } else if (ft.action === "w") {
        //Pass the step command on to the current sub-process,
        ft.worker.postMessage({step : true})
        env.stack.push(ft)
    }
}



