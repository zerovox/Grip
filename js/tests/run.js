define(['models/EditorModel'], function (EditorModel) {
    //The number of tests per primitive to perform
    var tests = 20;

    function createGUID() {
        //Snippet to generate a guid from http://stackoverflow.com/a/2117523. Any code with a very high probability of no collisions would work here. I'm surprised Javascript doesn't have generation of GUIDs as a built in function
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function newFunctionModel(name, arg) {
        return {function : name, y : 50, x : 100, name : createGUID(), inputs : {}, arg : arg};
    }

    function newCb(out, worker, done) {
        return function (result) {
            if (result.data.result !== undefined) {
                console.log(result.data.result)
                result.data.result.should.equal(out)
                worker.terminate()
                done()
            }
        }
    }

    function simpleWorker(name, inputs, output, done) {
        var editor = new EditorModel({tests : {}});
        var plus = newFunctionModel(name)
        editor.addFunction(plus);
        _.each(inputs, function (value, key) {
            editor.addInput(key);
            editor.linkInput(plus.name, key, key)
        }, this)
        editor.linkOutput(plus.name)

        var worker = new Worker('js/workers/run.js');
        var on = newCb(output, worker, done)
        worker.onmessage = _.bind(on, this)
        worker.postMessage({main : "func", localFunctions : {"func" : editor.get("map")}, inputs : inputs});
    }

    describe('Run worker - Arithmetical Primitives', function () {
        for (var k = 0; k < tests; k++) {
            (function () {
                var i = Math.random() * Math.pow(2, k)
                var j = Math.random() * Math.pow(2, (tests - 10) - k)
                var result = i + j;
                it('should correctly perform ' + i + ' + ' + j + ' = ' + result, function (done) {
                    new simpleWorker("plus", {a : i, b : j}, result, done)
                });
            }());
        }
        for (var k = 0; k < tests; k++) {
            (function () {
                var i = Math.random() * Math.pow(2, k)
                var j = Math.random() * Math.pow(2, tests / 2 - k)
                var result = i * j;
                it('should correctly perform ' + i + ' * ' + j + ' = ' + result, function (done) {
                    new simpleWorker("multiply", {a : i, b : j}, result, done)
                });
            }());
        }
        for (var k = 0; k < tests; k++) {
            (function () {
                var i = Math.random() * Math.pow(2, k)
                var j = Math.random() * Math.pow(2, (tests - 10) - k)
                var result = i - j;
                it('should correctly perform ' + i + ' - ' + j + ' = ' + result, function (done) {
                    new simpleWorker("minus", {a : i, b : j}, result, done)
                });
            }());
        }
    });

    describe('Run worker - Comparison Primitives', function () {
        for (var k = 0; k < tests; k++) {
            (function () {
                var i = Math.random() * Math.pow(2, k)
                var j = Math.random() * Math.pow(2, k)
                var result = i < j;
                it('should correctly perform ' + i + ' < ' + j + ' = ' + result, function (done) {
                    new simpleWorker("less than", {a : i, b : j}, result, done)
                });
            }());
        }
        for (var k = 0; k < tests; k++) {
            (function () {
                var i = Math.random() * Math.pow(2, k)
                var j = Math.random() * Math.pow(2, k)
                var result = i > j;
                it('should correctly perform ' + i + ' > ' + j + ' = ' + result, function (done) {
                    new simpleWorker("greater than", {a : i, b : j}, result, done)
                });
            }());
        }
    });

    describe('Run worker - Equality primitives', function () {
        it('should correctly perform equality between different values', function (done) {
            simpleWorker("equals", {a : 0, b : 1}, false, done)
        });
        it('should correctly perform equality between integers and strings', function (done) {
            simpleWorker("equals", {a : 0, b : "0"}, false, done)
        });
        it('should correctly perform equality', function (done) {
            simpleWorker("equals", {a : 0, b : "zero"}, false, done)
        });
        it('should correctly perform equality when things are equal', function (done) {
            simpleWorker("equals", {a : 0, b : 0}, true, done)
        });
        it('should correctly perform \'is zero\' on some value that\'s not-zero', function (done) {
            simpleWorker("is zero", {a : 1 + Math.random()}, false, done)
        });
        it('should correctly perform \'is zero\' on the string \"0\"', function (done) {
            simpleWorker("is zero", {a : "0"}, false, done)
        });
        it('should correctly perform \'is zero\' on other strings', function (done) {
            simpleWorker("equals", {a : "zero"}, false, done)
        });
    });
    describe('Run worker - Other Primitives', function () {
        it('should correctly perform if/then/else');

        it('should correctly perform or');
        it('should correctly perform and');
        it('should correctly perform join');
        it('should correctly perform length');
        it('should correctly perform take');
        it('should correctly perform drop');
    });

});