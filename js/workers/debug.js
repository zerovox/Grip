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

function newEnv(func, editor, inputs) {
    return {
        func   : func,
        editor : editor,
        inputs : inputs,
        stack  : [
            {fName : func, action : "e"}
        ]
    }
}

function execute(env) {
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
                env.stack.push({fName : f.inputs[response.need], action : "e"})
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
            env.stack.push({fName : f.inputs[response.need], action : "e"})
        }
    }
}

var env;

self.onmessage = function (event) {
    if (event.data.editor !== undefined) {

        var editor = event.data.editor;
        var inputs = event.data.inputs

        if (editor.output === undefined)
            fail("No function wired to output")
        else {
            env = newEnv(editor.output, editor, inputs);
        }
    } else if (event.data.step) {
        if (env === undefined) {
            fail("Worker not initialized")
        } else {
            if (env.stack.length !== 0) {
                execute(env)
                debug(env.editor)
            } else {
                success(env.returnVal);
            }
        }
    } else {
        fail("No instruction given to worker")
    }

}

