var primitives = (function () {
    return [
        {
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
        },
        {
            name   : "multiply",
            group  : "Mathematical",
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) * parseFloat(b), debug : "Calculated " + a + " * " + b}}}
                }}
            },
            inputs : ["a", "b"]
        },
        {
            name   : "plus",
            group  : "Mathematical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) + parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        },
        {
            name   : "equals",
            group  : "Logical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a == b, debug : "Calculated " + a + " == " + b}}}
                }}
            }
        },
        {
            name   : "minus",
            group  : "Mathematical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) - parseFloat(b), debug : "Calculated " + a + " - " + b}}}
                }}
            }
        },
        {
            inputs : ["test", "then", "els"],
            group  : "Logical",
            name   : "if",
            apply  : function () {
                return {need : "test", cont : function (test) {
                    if (/true/i.test(test))
                        return {need : "then", cont : function (then) {return {result : then}}}
                    else
                        return {need : "els", cont : function (els) {return {result : els}}}
                }}
            }
        },
        {
            group  : "Logical",
            inputs : [],
            name   : "true",
            apply  : function () {
                return {result : true}
            }
        },
        {
            group  : "Logical",
            inputs : [],
            name   : "false",
            apply  : function () {
                return {result : false}
            }
        },
        {
            name   : "successor",
            group  : "Mathematical",
            inputs : ["a"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {result : parseFloat(a) + 1, debug : "Calculated " + a + " + 1"}
                }}
            }
        },
        {
            name   : "predecessor",
            group  : "Mathematical",
            inputs : ["a"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {result : parseFloat(a) - 1, debug : "Calculated " + a + " - 1"}
                }}
            }
        },
        {
            name   : "is zero",
            group  : "Mathematical",
            inputs : ["a"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {result : parseFloat(a) === 0, debug : "Calculated (" + a + " = 0)?"}
                }}
            }
        },
        {
            name   : "or",
            group  : "Logical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a || b, debug : "Calculated " + a + " or " + b}}}
                }}
            }
        },
        {
            name   : "and",
            group  : "Logical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a && b, debug : "Calculated " + a + " and " + b}}}
                }}
            }
        },
        {
            name   : "not",
            group  : "Logical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {result : !a, debug : "Calculated not " + a}
                }}
            }
        },
        {
            name   : "join",
            group  : "String",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a + b, debug : "Calculated " + a + b}}}
                }}
            }
        },
        {
            name   : "length",
            group  : "String",
            inputs : ["string"],
            apply  : function () {
                return {need : "string", cont : function (a) {
                    return {result : a.length, debug : "Calculated length of " + a}
                }}
            }
        },
        {
            name   : "take",
            group  : "String",
            inputs : ["string", "n"],
            apply  : function () {
                return {need : "string", cont : function (a) {
                    return {need : "n", cont : function (b) {return {result : a.substr(0, b), debug : "Took first " + b + " characters from " + a}}}
                }}
            }
        },
        {
            name   : "drop",
            group  : "String",
            inputs : ["string", "n"],
            apply  : function () {
                return {need : "string", cont : function (a) {
                    return {need : "n", cont : function (b) {return {result : a.substr(b, a.length - b), debug : "Dropped first " + b + " characters from " + a}}}
                }}
            }
        },
        {
            name   : "less than",
            group  : "Mathematical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) < parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        },
        {
            name   : "greater than",
            group  : "Mathematical",
            inputs : ["a", "b"],
            apply  : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) > parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        }
    ];
})();