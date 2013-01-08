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
    if (debugging)
        self.postMessage({debug : editor})
}

function execute(func, editor, inputs) {
    var returnVal;
    var stack = [];
    stack.push({fName : func, action : "e"});

    while (stack.length !== 0) {
        var ft = stack.pop();
        var f = editor.functions[ft.fName];
        if (ft.action === "e") {
            if (f === undefined) {
                returnVal = inputs[ft.fName];
            } else if (resultCaching && f.result !== undefined) {
                returnVal = f.result
            } else {
                f.active = true
                f.result = undefined;
                var response = prims[f.function].apply()
                if (response.result !== undefined) {
                    f.result = response.result;
                    f.active = false
                    returnVal = f.result
                } else {
                    stack.push({fName : ft.fName, action : "r", cont : response.cont})
                    stack.push({fName : f.inputs[response.need], action : "e"})
                }
            }
        } else if (ft.action === "r") {
           var response = ft.cont(returnVal)
            if (response.result !== undefined) {
                f.result = response.result;
                f.active = false
                returnVal = f.result
            } else {
                stack.push({fName : ft.fName, action : "r", cont : response.cont})
                stack.push({fName : f.inputs[response.need], action : "e"})
            }
        }

    }
    return returnVal;
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

