//This gives us access to the variable primitives, the array of primitive functions
importScripts('data/primitives.js', 'libs/lodash.min.js')

var resultCaching = true
var env;
var localFunctions;
var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

onmessage = function (event) {
    if ("main" in event.data) {
        env = newEnv(event.data.localFunctions[event.data.main], event.data.inputs);
        localFunctions = event.data.localFunctions
    } else if ("step" in event.data) {
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
    } else if ("input" in event.data) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            env.returnVal = event.data.value
        }
    } else if ("need" in event.data) {
        var ft = env.stack.pop()
        if (ft.action === "w") {
            env.stack.push({action : "u", need : event.data.need})
            env.stack.push({func : env.editor.functions[event.data.need], action : "e"})
        } else {
            debug(env.editor)
            fail("Current action was not waiting on a sub-process result, but a sub-process asked for a dependency. Dependency was:" + event.data.need)
        }
    } else if ("log" in event.data) {
        log("From sub-worker: " + event.data.log)
    } else if ("result" in event.data) {
        var ft = env.stack.pop()
        if (ft.action === "w") {
            env.returnVal = event.data.result
        } else {
            debug(env.editor)
            fail("Current action was not waiting on a sub-process result, but one was returned. Result was:" + event.data.result)
        }
    } else if ("fail" in event.data) {
        fail(event.data.fail)
    } else if ("debug" in event.data) {
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
                //TODO: Check if editor.functions[editor.output] exists, otherwise use "i" mode
                {func : editor.functions[editor.output], action : "e"}
            ]
        }
}

function step(env) {
    var ft = env.stack.pop();
    switch (ft.action) {
        case "e" :
            //Check cache for a result to the ft.func call, if not found, pass the 'real' implemented function on to the "r" action to run
            if (resultCaching && "result" in ft.func) {
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
                    env.stack.push({func : ft.func, action : "r", cont : function () {return response.apply()}})
                } else if(ft.func.function in localFunctions) {
                    var worker = new Worker('debug.js')
                    worker.postMessage({main:ft.func.function, localFunctions : localFunctions})
                    env.stack.push({worker : worker, action : "w"})
                    log("Started worker on " + ft.func.function)
                }
            }
            break
        case "r":
            //Run the function in ft.cont, then respond according to the need
            if (typeof inp !== "undefined")
                inp.responded = true;
            var response = ft.cont(env.returnVal)
            if ("result" in response) {
                ft.func.result = response.result;
                ft.func.active = false
                env.returnVal = ft.func.result
            } else {
                if (response.need in ft.func.inputs) {
                    var inp = ft.func.inputs[response.need]
                    env.stack.push({func : ft.func, action : "r", cont : response.cont, using : inp})
                    inp.requested = true
                    if (inp.wired in env.editor.functions)
                        env.stack.push({func : env.editor.functions[inp.wired], action : "e"})
                    else
                        env.stack.push({input : inp.wired, action : "i"})
                } else {
                    fail("Unwired function exception")
                }
            }
            break
        case "w":
            log("Passing on step")
            //Pass the step command on to the current sub-process
            ft.worker.postMessage({step : true})
            env.stack.push(ft)
            break
        case "i":
            //Request an input, expect it to be placed on env.returnVal before next step command issued
            requestInput(ft.input)
            break
        case "u":
            //Update a sub-process with an input, then pass through any new step commands
            env.stack.push({worker : ft.worker, action : "w"})
            ft.worker.postMessage({input : ft.need, value : env.returnVal})
    }
}



