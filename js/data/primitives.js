var str = function (s) {
    return typeof s == "string"
}

var bool = function (b) {
    return typeof b == "boolean"
}

var dbl = function (d) {
    return typeof d == "number"
}

var any = function () {
    return true
}

var same = function (a) {
    return function (b) {
        return typeof a === typeof b
    }

}

var need = function (name, type, cont) {
    return function () {
        var args = toArray(arguments);
        return {need : name, cont : function (a) {
            args.push(a)
            if (type(a))
                return cont.apply(null, args);
            else
                return {fail : "type error"}
        }}
    }
}

//arguments is an object. Javascript is crazy.
function toArray(as){
    var len = as.length
    var newArgs = []
    for (var i=0; i<len; i++) {
        newArgs.push(as[i])
    }
    return newArgs;
}

var primitives = (function () {
    return [
        {
            name      : "number",
            group     : "Mathematical",
            arg       : true,
            toHaskell : function (inputs, arg) {
                return arg
            },
            'new'     : function (arg) {
                return {
                    name      : "number",
                    inputs    : [],
                    toHaskell : function (inputs) {
                        return arg
                    },
                    arg       : arg,
                    apply     : function () {
                        return {result : arg, debug : "Constant"};
                    }
                }
            }
        },
        {
            name      : "multiply",
            group     : "Mathematical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " * " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) * parseFloat(b), debug : "Calculated " + a + " * " + b}}}
                }}
            }
        },
        {
            name      : "plus",
            group     : "Mathematical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " + " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) + parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        },
        {
            name      : "equals",
            group     : "Logical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " == " + inputs.b + ")"
            },
            apply     : need("a", any, need("b", any, function (a, b, c) {
                    if (same(a)(b))
                        return {result : a == b, debug : "Calculated " + a + " == " + b}
                    else
                        return {result : false, debug : "Inputs of different types"}
                }
            ))

        },
        {
            name      : "minus",
            group     : "Mathematical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " - " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) - parseFloat(b), debug : "Calculated " + a + " - " + b}}}
                }}
            }
        },
        {
            name      : "if",
            inputs    : ["test", "then", "else"],
            group     : "Logical",
            toHaskell : function (inputs) {
                return "(if " + inputs.test + " then " + inputs.then + " else " + inputs.else + ")"
            },
            apply     : function () {
                return {need : "test", cont : function (test) {
                    if (/true/i.test(test))
                        return {need : "then", cont : function (then) {return {result : then}}}
                    else
                        return {need : "else", cont : function (els) {return {result : els}}}
                }}
            }
        },
        {
            group     : "Logical",
            inputs    : [],
            name      : "true",
            toHaskell : function (inputs) {
                return "True"
            },
            apply     : function () {
                return {result : true}
            }
        },
        {
            group     : "Logical",
            inputs    : [],
            name      : "false",
            toHaskell : function (inputs) {
                return "False"
            },
            apply     : function () {
                return {result : false}
            }
        },
        {
            name      : "successor",
            group     : "Mathematical",
            inputs    : ["a"],
            toHaskell : function (inputs) {
                return "(succ " + inputs.a + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {result : parseFloat(a) + 1, debug : "Calculated " + a + " + 1"}
                }}
            }
        },
        {
            name      : "predecessor",
            group     : "Mathematical",
            inputs    : ["a"],
            toHaskell : function (inputs) {
                return "(pred " + inputs.a + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {result : parseFloat(a) - 1, debug : "Calculated " + a + " - 1"}
                }}
            }
        },
        {
            name      : "is zero",
            group     : "Mathematical",
            inputs    : ["a"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " == 0)"
            },
            apply     : need("a", any, function (a) {
                if (dbl(a))
                    return {result : a === 0, debug : "Calculated (" + a + " = 0)?"}
                else
                    return {result : false, debug : "Not a number"}
            })

        },
        {
            name      : "or",
            group     : "Logical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " || " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a || b, debug : "Calculated " + a + " or " + b}}}
                }}
            }
        },
        {
            name      : "and",
            group     : "Logical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " && " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a && b, debug : "Calculated " + a + " and " + b}}}
                }}
            }
        },
        {
            name      : "not",
            group     : "Logical",
            inputs    : ["a"],
            toHaskell : function (inputs) {
                return "(not " + inputs.a + ")"
            },
            apply     : need("a", bool, function (a) {
                return {result : !a, debug : "Calculated not " + a}
            })

        },
        {
            name      : "join",
            group     : "String",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " ++ " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : a + b, debug : "Calculated " + a + b}}}
                }}
            }
        },
        {
            name      : "length",
            group     : "String",
            inputs    : ["string"],
            toHaskell : function (inputs) {
                return "(len " + inputs.string + ")"
            },
            apply     : function () {
                return {need : "string", cont : function (a) {
                    return {result : a.length, debug : "Calculated length of " + a}
                }}
            }
        },
        {
            name      : "take",
            group     : "String",
            inputs    : ["string", "n"],
            toHaskell : function (inputs) {
                return "(take " + inputs.n + " " + inputs.string + ")"
            },
            apply     : function () {
                return {need : "string", cont : function (a) {
                    return {need : "n", cont : function (b) {return {result : a.substr(0, b), debug : "Took first " + b + " characters from " + a}}}
                }}
            }
        },
        {
            name      : "drop",
            group     : "String",
            inputs    : ["string", "n"],
            toHaskell : function (inputs) {
                return "(drop " + inputs.n + " " + inputs.string + ")"
            },
            apply     : function () {
                return {need : "string", cont : function (a) {
                    return {need : "n", cont : function (b) {return {result : a.substr(b, a.length - b), debug : "Dropped first " + b + " characters from " + a}}}
                }}
            }
        },
        {
            name      : "less than",
            group     : "Mathematical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " < " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) < parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        },
        {
            name      : "greater than",
            group     : "Mathematical",
            inputs    : ["a", "b"],
            toHaskell : function (inputs) {
                return "(" + inputs.a + " > " + inputs.b + ")"
            },
            apply     : function () {
                return {need : "a", cont : function (a) {
                    return {need : "b", cont : function (b) {return {result : parseFloat(a) > parseFloat(b), debug : "Calculated " + a + " + " + b}}}
                }}
            }
        }
    ];
})();
