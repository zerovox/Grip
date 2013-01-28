var primitives = (function () {
    var mul = {
        name   : "multiply",
        group: "Mathematical",
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseInt(a) * parseInt(b), debug : "Calculated " + a + " * " + b}}}
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
                return {need : "b", cont : function (b) {return {result : parseInt(a) + parseInt(b), debug : "Calculated " + a + " + " + b}}}
            }}
        }
    }

    var minus = {
        name   : "minus",
        group: "Mathematical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseInt(a) - parseInt(b), debug : "Calculated " + a + " - " + b}}}
            }}
        }
    }

    var equals = {
        name   : "equals",
        group: "Expressions",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseInt(a) == parseInt(b), debug : "Calculated " + a + " == " + b}}}
            }}
        }
    }

    var ifc = {
        inputs : ["test", "then", "els"],
        group: "Expressions",
        name   : "ifc",
        apply  : function () {
            return {need : "test", cont : function (test) {
                if (/true/i.test(test))
                    return {need : "then", cont : function (then) {return {result : then}}}
                else
                    return {need : "els", cont : function (els) {return {result : els}}}
            }}
        }
    }

    var constant = {
        name  : "constant",
        group : "Expressions",
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

    return [mul, plus, constant, equals, minus, ifc];
})();