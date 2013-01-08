//This gives us access to the variable primitives, the array of primitive functions
importScripts('/js/data/primitives.js', '/js/libs/lodash.min.js')

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
        var response = prims[f.function].apply()
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
        log("Requesting output from: " + f.inputs[response.need])
        var evalArg = execute(f.inputs[response.need], editor, inputs)
        var continuationResponse = response.cont(evalArg)
        return cont(continuationResponse, f, editor, inputs)
    } else {
        return response.result;
    }
}

self.onmessage = function (event) {
    var editor = event.data.editor;
    var debugLevel = event.data.debugLevel
    var inputs = event.data.inputs

    if (editor.output === undefined)
        fail("No function wired to output")
    else {
        log("Requesting output from: " + editor.output)
        success(execute(editor.output, editor, inputs));
    }
}

