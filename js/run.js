//This gives us access to the variable primitives, the array of primitive functions
importScripts('data/primitives.js', 'libs/lodash.min.js')

var resultCaching = true
var debugging = true

var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim
})

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
    if(debugging)
        self.postMessage({debug : editor})
}

function execute(func, editor, inputs) {
    //Look for the function named f in our editor
    var f = editor.functions[func]
    //If the function isn't found, it must be an input, so return the inputs value
    if (f === undefined)
        return inputs[func]
    //Set the function as active
    f.active = true
    //If debugging is enabled, send the current editor status to the task controller
    debug(editor)
    //Check the function cache for a result
    if (resultCaching && f.result !== undefined) {
        //cache hit, we don't need to repeat the calculations here
    } else {
        //cache not hit, must be the first time this function has been requested, so we must apply it
        var functionToApply;
        //If f has an argument, we must create a new instance of the function, e.g if the function is constant and we have an argument of 10, we want to create a new function that when applied, gives us the result 10
        if(f.arg !== undefined){
            functionToApply = prims[f.function].new(f.arg)
        } else {
            functionToApply = prims[f.function]
        }
        var response = functionToApply.apply()
        log("this " + response)
        //cont() takes the response from the function application, and returns the result after satisfying any arguments it depends on
        f.result = cont(response, f, editor, inputs)
    }
    //Since we have a result, deactivate the function
    f.active = false
    //If debugging is enabled, send the current editor status to the task controller
    debug(editor)
    //Return the result
    return f.result
}

function cont(response, f, editor, inputs) {
    if (response.result === undefined) {
        var inp = f.inputs[response.need]
        if(inp === undefined){
            fail("Unwired function exception")
        } else {
            log("Requesting output from: " + inp.wired)
            var evalArg = execute(inp.wired, editor, inputs)
            var continuationResponse = response.cont(evalArg)
            return cont(continuationResponse, f, editor, inputs)
        }
    } else {
        return response.result;
    }
}

self.onmessage = function (event) {
    var editor = event.data.localFunctions[event.data.main];
    var inputs = event.data.inputs
    if (editor.output === undefined)
        fail("No function wired to output")
    else {
        log("Requesting output from: " + editor.output)
        success(execute(editor.output, editor, inputs));
    }
}

