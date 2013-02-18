//This gives us access to the variable primitives, the array of primitive functions
importScripts('../data/primitives.js', '../libs/lodash.min.js')

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
                ft.func.result = undefined;
                if (ft.func.function in prims) {
                    var functionToApply;
                    if (ft.func.arg !== undefined) {
                        functionToApply = prims[ft.func.function].new(ft.func.arg)
                    } else {
                        functionToApply = prims[ft.func.function]
                    }
                    var response = functionToApply.apply
                    env.stack.push(e(ft, {action : "r", cont : function () {return response.apply()}}))
                } else if (ft.func.function in localFunctions) {
                    var editor = _.clone(LocalFunctionsFresh[ft.func.function], true)
                    env.stack.push(e(ft, {action : "r", cont : function (result) { return {result : result}}}))
                    //We don't use the extend here, as we want to create a fresh stack frame
                    env.stack.push({func : editor.functions[editor.output], action : "e", editor : editor, callee : ft, name : ft.func.function})
                }
            }
            break
        case "r":
            //Run the function in ft.cont, then respond according to the need
            var response = ft.cont(env.returnVal)
            if ("result" in response) {
                env.returnVal = response.result
                if ("func" in ft)
                    ft.func.result = env.returnVal
            } else {
                if (response.need in ft.func.inputs) {
                    var inp = ft.func.inputs[response.need]
                    env.stack.push(e(ft, {action : "r", cont : response.cont}))
                    if (inp.wired in ft.editor.functions) {
                        env.stack.push(e(ft, {action : "e", func : ft.editor.functions[inp.wired]}))
                    } else
                        env.stack.push(e(ft, {action : "i", input : inp.wired}))
                } else {
                    fail("Unwired function exception")
                }
            }
            break
        case "i":
            log("Requesting input " + ft.input + " from " + ft.inputs)
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

