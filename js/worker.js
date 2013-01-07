//This gives us access to the variable primitives, the array of primitive functions
importScripts('/js/data/primitives.js', '/js/libs/lodash.min.js')

var prims = {}
_.each(primitives, function (prim) {
    prims[prim.name] = prim;
})

function log(data) {
    self.postMessage({log : data});
}

function success(result){
    self.postMessage({result : result});
}

function fail(reason){
    self.postMessage({fail : reason});
}

function execute(func, editor, inputs) {
    var f = editor.functions[func]
    if (f === undefined)
        return inputs[func];
    var response = prims[f.function].apply();
    return cont(response, f, editor, inputs)
}

function cont(response, f, editor, inputs) {
    if (response.result === undefined) {
        var evalArg = execute(f.inputs[response.need], editor, inputs)
        var continuationResponse = response.cont(evalArg)
        return cont(continuationResponse, f, editor, inputs);
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
    else
        success(execute(editor.output, editor, inputs));
}

