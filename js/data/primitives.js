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
        group: "Logical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a == b, debug : "Calculated " + a + " == " + b}}}
            }}
        }
    }

    var lt = {
        name   : "less than",
        group: "Mathematical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseFloat(a) < parseFloat(b), debug : "Calculated " + a + " + " + b}}}
            }}
        }
    }

    var gt = {
        name   : "greater than",
        group: "Mathematical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : parseFloat(a) > parseFloat(b), debug : "Calculated " + a + " + " + b}}}
            }}
        }
    }

    var ifc = {
        inputs : ["test", "then", "els"],
        group: "Logical",
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
        group: "Logical",
        inputs : [],
        name   : "true",
        apply  : function () {
            return {result : true}
        }
    }

    var fals = {
        group: "Logical",
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
                name   : "number",
                inputs : [],
                arg    : arg,
                apply  : function () {
                    return {result : arg, debug : "Constant"};
                }
            }
        }
    }

    var succ = {
        name   : "successor",
        group: "Mathematical",
        inputs : ["a"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {result : parseFloat(a)+1, debug : "Calculated " + a + " + 1"}
            }}
        }
    }
    var pred = {
        name   : "predecessor",
        group: "Mathematical",
        inputs : ["a"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {result : parseFloat(a)-1, debug : "Calculated " + a + " - 1"}
            }}
        }
    }

    var ez = {
        name   : "is zero",
        group: "Mathematical",
        inputs : ["a"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {result : parseFloat(a)===0, debug : "Calculated (" + a + " = 0)?"}
            }}
        }
    }

    var or = {
        name   : "or",
        group: "Logical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a || b, debug : "Calculated " + a + " or " + b}}}
            }}
        }
    }

    var and = {
        name   : "and",
        group: "Logical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a && b, debug : "Calculated " + a + " and " + b}}}
            }}
        }
    }

    var not = {
        name   : "not",
        group: "Logical",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
               return {result : !a, debug : "Calculated not " + a}
            }}
        }
    }

    var join = {
        name   : "join",
        group: "String",
        inputs : ["a", "b"],
        apply  : function () {
            return {need : "a", cont : function (a) {
                return {need : "b", cont : function (b) {return {result : a + b, debug : "Calculated " + a + b}}}
            }}
        }
    }

    var length = {
        name   : "length",
        group: "String",
        inputs : ["string"],
        apply  : function () {
            return {need : "string", cont : function (a) {
                return {result : a.length, debug : "Calculated length of " + a}
            }}
        }
    }

    var take = {
        name   : "take",
        group: "String",
        inputs : ["string", "n"],
        apply  : function () {
            return {need : "string", cont : function (a) {
                return {need : "n", cont : function (b) {return {result : a.substr(0,b), debug : "Took first " + b + " characters from " + a}}}
            }}
        }
    }
    var drop = {
        name   : "drop",
        group: "String",
        inputs : ["string", "n"],
        apply  : function () {
            return {need : "string", cont : function (a) {
                return {need : "n", cont : function (b) {return {result : a.substr(b, a.length-b), debug : "Dropped first " + b + " characters from " + a}}}
            }}
        }
    }


    return [constant, mul, plus, equals, minus, ifc, tru, fals, succ, pred, ez, or, and, not, join, length, take, drop, lt, gt];
})();