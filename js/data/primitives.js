var primitives = (function () {
    var mul = {
        name   : "multiply",
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a * b}}}
            }}
        },
        inputs : ["a", "b"]
    }

    var plus = {
        name   : "plus",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a + b}}}
            }}
        }
    }

    var minus = {
        name   : "minus",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a - b}}}
            }}
        }
    }

    var equals = {
        name   : "equals",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a === b}}}
            }}
        }
    }

    var ifc = {
        inputs : ["test", "then", "els"],
        name   : "if",
        apply  : function () {
            return {need : "test", cont : function (test) {
                if (test)
                    return {need : "then", cont : function (then) {return {result : then}}}
                else
                    return {need : "els", cont : function (els) {return {result : els}}}
            }}
        }
    }

    var constant = {
        name   : "constant",
        arg    : true,
        'new'  : function (arg) {
            return {
                name   : "constant",
                inputs : [],
                arg    : arg,
                apply  : function () {
                    return {result : arg};
                }
            }
        }
    }

    return [mul, plus, constant, equals, minus, ifc];
})();