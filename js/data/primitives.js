var primitives = (function () {
    var mul = {
        name   : "multiply",
        group: "Mathematical",
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseFloat(a) * parseFloat(b), debug : "Calculated " + a + " * " + b}}}
            }}
        },
        inputs : ["a", "b"]
    }

    var plus = {
        name   : "plus",
        group: "Mathematical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseFloat(a) + parseFloat(b), debug : "Calculated " + a + " + " + b}}}
            }}
        }
    }

    var minus = {
        name   : "minus",
        group: "Mathematical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseFloat(a) - parseFloat(b), debug : "Calculated " + a + " - " + b}}}
            }}
        }
    }

    var equals = {
        name   : "equals",
        group: "Logic",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a === b, debug : "Calculated " + a + " == " + b}}}
            }}
        }
    }

    var ifc = {
        inputs : ["test", "then", "els"],
        group: "Logic",
        name   : "if",
        apply  : function () {
            return {need : "test", cont : function (test) {
                if (/true/i.test(test))
                    return {need : "then", cont : function (then) {return {result : then}}}
                else
                    return {need : "els", cont : function (els) {return {result : els}}}
            }}
        }
    }

    var tru = {
        group: "Logic",
        inputs : [],
        name   : "true",
        apply  : function () {
            return {result : true}
        }
    }

    var fals = {
        group: "Logic",
        inputs : [],
        name   : "false",
        apply  : function () {
            return {result : false}
        }
    }

    var constant = {
        name  : "number",
        group : "Mathematical",
        arg   : true,
        'new' : function (arg) {
            return {
                name   : "constant",
                inputs : [],
                arg    : arg,
                apply  : function () {
                    return {result : arg, debug : "Constant"};
                }
            }
        }
    }

    return [constant, mul, plus, equals, minus, ifc, tru, fals];
})();