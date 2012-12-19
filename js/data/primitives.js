define([], function () {

    return (function () {

        var plus = (function () {
            var a;
            var b;

            function output() {
                return a.output() + b.output();
            }

            function input(input, val) {
                if (input === "a") {
                    a = val;
                }
                if (input === "b") {
                    b = val;
                }
            }

            return {
                name:"+",
                output:output,
                input:input,
                inputs:["a", "b"]
            }
        });
        var minus = (function () {
            var a;
            var b;

            function output() {
                return a.output() - b.output();
            }

            function input(input, val) {
                if (input === "a") {
                    a = val;
                }
                if (input === "b") {
                    b = val;
                }
            }

            return {
                name:"-",
                output:output,
                input:input,
                inputs:["a", "b"]
            }
        });
        var mul = (function () {
            var a;
            var b;

            function output() {
                return a.output() * b.output();
            }

            function input(input, val) {
                if (input === "a") {
                    a = val;
                }
                if (input === "b") {
                    b = val;
                }
            }

            return {
                name:"X",
                output:output,
                input:input,
                inputs:["a", "b"]
            }
        });
        var equals = (function () {
            var a;
            var b;

            function output() {
                return a.output() === b.output();
            }

            function input(input, val) {
                if (input === "a") {
                    a = val;
                }
                if (input === "b") {
                    b = val;
                }
            }

            return {
                name:"=",
                output:output,
                input:input,
                inputs:["a", "b"]
            }
        });

        var ifc = (function () {
            var a;
            var b;
            var c;

            function output() {
                return a.output() ? b.output() : c.output();
            }

            function input(input, val) {
                if (input === "test") {
                    a = val;
                }
                if (input === "then") {
                    b = val;
                }
                if (input === "else") {
                    c = val;
                }
            }

            return {
                name:"if",
                output:output,
                input:input,
                inputs:["test", "then", "else"]
            }
        });

        var constant = (function (a) {
            function output() {
                return a;
            }

            function input() {
                return;
            }

            return {
                name:"" + a,
                output:output,
                input:input,
                inputs:[]
            }
        })
        return {
            plus:plus,
            mul:mul,
            constant:constant,
            equals:equals,
            minus:minus,
            ifc:ifc
        }
    })();
    ;

});