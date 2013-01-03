define([], function () {
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
                    return {need : "then", cont : function (then) {return then}}
                else
                    return {need : "els", cont : function (els) {return els}}
            }}
        }
    }

    var constant = (function (arg) {
        return {
            name   : "const",
            inputs : [],
            apply  : function () {
                return arg;
            }}
    })

    return [mul, plus, constant, equals, minus, ifc]

});