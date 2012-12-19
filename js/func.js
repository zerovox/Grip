var grid = 0;

function setUpView() {
    grid = view.viewSize.width / 40;
    if (grid < 30) {
        grid = 30;
    }
}

setUpView();

function onResize(event) {
    setUpView();
    editorController.getEditorState().draw();
}

_.mixin({
    deepclone:function (object) {
        return jQuery.extend(true, {}, object);
    }
});

var functions = (function () {

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

var scenarios = (function () {
    var scenarios = []
    var add = function (scenario) {
        scenarios.push(scenario);
        broadcast(scenario);
    }
    var remove = function (scenarioNo) {
        delete scenarios[scenarioNo];
        _.compact(scenarios);
    }

    var select = function (scenario) {
        broadcast(scenarios[scenario]);
    }

    var listeners = []

    function subscribe(that) {
        listeners.push(that);
    }

    function unsubscribe(that) {
        listeners = _.without(listeners, that);
    }

    function broadcast(obj) {
        for (var l in listeners) {
            listeners[l](obj);
        }
    }

    function get() {
        return scenarios;
    }

    return {
        get:get,
        remove:remove,
        add:add,
        subscribe:subscribe,
        unsubscribe:unsubscribe,
        select:select
    }
})();

var editors = (function () {
    var editors = []
    var add = function (editor) {
        editors.push(editor);
        broadcast(editor);
    }
    var remove = function (editorNo) {
        delete editors[editorNo];
        _.compact(editors);
    }

    var select = function (editorNo) {
        broadcast(editors[editorNo]);
    }

    var listeners = []

    function subscribe(that) {
        listeners.push(that);
    }

    function unsubscribe(that) {
        listeners = _.without(listeners, that);
    }

    function broadcast(obj) {
        for (var l in listeners) {
            listeners[l](obj);
        }
    }

    function get() {
        return editors;
    }

    scenarios.subscribe(function (scen) {
        editors = [];
        add(scen.editor);
    });

    return {
        get:get,
        remove:remove,
        add:add,
        subscribe:subscribe,
        unsubscribe:unsubscribe,
        select:select
    }
})();

function onMouseDown(event) {
    var selected = event.item;
    if (selected != null && selected.name === 'comp') {
        if (selected.children['func'].hitTest(event.point) != null) {
            selected = selected.children['func'];
        } else if (selected.children['output'].hitTest(event.point) != null) {
            selected = selected.children['output'];
        }
    }
    editorController.getEditorState().select(selected);
}

function onMouseUp(event) {
    editorController.getEditorState().select(null);
}

function onMouseMove(event) {
    editorController.getEditorState().move(event);
}

function gridToPoint(x) {
    return x * grid
}

function pointToGrid(x) {
    var y = (x / grid).floor()
    if (y.x < 0) {
        y.x = 0;
    }
    if (y.y < 0) {
        y.y = 0;
    }
    return y
}

function funcview(map) {
    var layer;
    var items = {};
    var outputs = {};
    var inputs = {};

    function func(name, obj) {
        var x = obj.x;
        var y = obj.y;
        var inputCount = _.size(obj.inputs);
        var path;
        x = gridToPoint(x) + 2;
        y = gridToPoint(y) + 2;
        var width = gridToPoint(inputCount == 0 ? 2 : 4) - 14;
        var height = gridToPoint(inputCount == 0 ? 1 : inputCount) - 4;
        var rect = new Rectangle([x, y], [width, height]);
        project.currentStyle.fillColor = 'black';
        var size = Math.abs(Math.sin(1 / 40)) * 150 + 10;
        path = new Path.RoundRectangle(rect, size);
        path.name = "func";
        path.strokeColor = "grey"
        var output = new Path.Rectangle([x + width, y + (grid / 2) - 5], [10, 10]);
        output.name = "output";
        outputs[name] = [x + width + 5, y + (grid / 2)];

        var compoundPath = new CompoundPath([path, output]);
        var no = 0;
        var ins = {};
        inputs[name] = {};
        for (var inputName in obj.inputs) {
            var input = new Path.Rectangle([x - 10, y + (grid * no) + grid / 2 - 5], [10, 10]);
            input.name = "input";
            var text = new PointText(new Point(x + 5, y + (grid * no) + grid / 2 + 3));
            text.fillColor = 'white';
            text.content = inputName;
            inputs[name][inputName] = [x - 5, y + (grid * no) + grid / 2]
            compoundPath.addChild(input);
            ins[input.id] = inputName;
            no++;
        }
        var fontSize = 12
        var text = new PointText(new Point(x + width - (fontSize * obj.iof.name.length) - 5, y + fontSize + 5));
        text.font = "consolas"
        text.fontSize = fontSize;
        text.fillColor = 'white';
        text.content = obj.iof.name;
        compoundPath.name = "comp";
        items[compoundPath.id] = [name, ins];
        return [compoundPath, ins];
    }

    function wire(name, obj) {
        for (var input in obj.inputs) {
            if (obj.inputs[input] != null) {
                var path = new Path();
                path.strokeColor = 'black';
                path.add(inputs[name][input]);
                path.add(outputs[obj.inputs[input]]);
                path.smooth();
            }
        }
    }

    function frame() {
        var point = new Point(5, 5);
        var size = new Size(view.viewSize.width - 15, view.viewSize.height - 15);
        var rectangle = new Rectangle(point, size);
        var path = new Path.Rectangle(rectangle);
        path.strokeColor = 'black';
        path.fillColor = 'white';
    }

    function draw() {
        layer = new Layer();
        frame();
        for (var name in map) {
            func(name, map[name]);
        }
        for (var name in map) {
            wire(name, map[name]);
        }
    }

    function remove() {
        layer.remove();
    }

    function paperIdToFunctionId(id) {
        return items[id][0];
    };
    function paperIdTofunctionInputs(id) {
        return items[id][1];
    };
    draw();

    return {
        fid:paperIdToFunctionId,
        fiid:paperIdTofunctionInputs,
        remove:remove
    }
}

function funcstate(map) {
    var fview;
    var prevEvent;
    var myPath = null;
    var selected = null;
    var selectedId;

    function move(event) {
        var pos = event.point;
        if (selected != null) {
            if (selectedId == null) {
                selectedId = fview.fid(selected.parent.id);
            }
            if (selected.name == "func") {
                var gridPos = pointToGrid(pos);
                map[selectedId].x = gridPos.x;
                map[selectedId].y = gridPos.y;
                draw();
            }
            if (selected.name == "output") {
                if (myPath == null) {
                    myPath = new Path();
                    myPath.add(selected.position)
                    myPath.add(pos)
                    myPath.add(pos)
                    myPath.fillColor = 'white'
                    myPath.strokeColor = 'black'
                }
                myPath.removeSegment(1)
                myPath.add(pos);
                prevEvent = event;
            }
        }
    }

    function select(obj) {
        if (myPath != null) {
            myPath.remove()
            myPath = null;
        }
        if (obj == null && prevEvent != null) {
            if (prevEvent.item != null) {
                var parentId = prevEvent.item.id;
                for (var i = 0; i < prevEvent.item.children.length; i++) {
                    var t = prevEvent.item.children[i].hitTest(prevEvent.point);
                    if (t != null) {
                        var inputName = fview.fiid(parentId)[t.item.id];
                        if (inputName != null) {
                            map[fview.fid(parentId)].inputs[inputName] = fview.fid(selected.parent.id);
                            draw();
                        }
                    }
                }
            }
            prevEvent = null;
        }
        selected = obj;
        selectedId = null;
    }

    function insertFunction(func) {
        var fcount = _.size(map);
        while (map[fcount] != null) {
            fcount++;
        }
        ins = {};
        for (var n in func.inputs) {
            ins[func.inputs[n]] = null;
        }
        var point = pointToGrid(new Point(view.viewSize.width, view.viewSize.height)) / 2;
        map[fcount] = {
            iof:func,
            inputs:ins,
            x:point.x,
            y:point.y
        }
        draw();
    }

    function draw() {
        if (fview != null) {
            fview.remove();
        }
        fview = funcview(map);
    }

    return{
        move:move,
        select:select,
        draw:draw,
        insertFunction:insertFunction,
    }
}

var editorController = (function () {
    var editor;

    editors.subscribe(function (obj) {
        editor = funcstate(obj.body);
        editor.draw();
    })
    var getEditorState = function () {
        return editor;
    }
    return {
        getEditorState:getEditorState
    }
})();

var scanrioMenuController = (function () {
    var scmenu = $('.scenarioMenu');
    scenarios.subscribe(function (o) {
        scmenu.empty();
        var scs = scenarios.get();
        _.each(scs, function (elem, i) {
            var active = "";
            if (o === elem) {
                active = " class=\"active\"";
            }
            $("<li" + active + "><a href=\"#\">" + elem.name + "</a></li>").appendTo(scmenu).click(function () {
                scenarios.select(i);
            });
        });
    })
})();

var editorMenuController = (function () {
    var emenu = $('.editorMenu');
    editors.subscribe(function (o) {
        emenu.empty();
        var es = editors.get();
        _.each(es, function (elem, i) {
            var active = "";
            if (o === elem) {
                active = " class=\"active\"";
            }
            $("<dd" + active + "><a href=\"#\">" + elem.name + "</a></dd>").appendTo(emenu).click(function () {
                editors.select(i);
            });
        });

        $("<dd><a href=\"#\">+</a></dd>").appendTo(emenu).click(function () {
            editors.add(newEditor());
        });
    })
})();

var editorDescriptionController = (function () {
    var infoBox = $('.infoBox');
    editors.subscribe(function (o) {
        infoBox.empty();
        infoBox.append(o.doc);
    })
})();

var s = {
    1:{
        iof:functions.plus(),
        inputs:{
            "a":2,
            "b":null
        },
        x:8,
        y:4
    },
    2:{
        iof:functions.constant(2),
        inputs:{},
        x:2,
        y:2
    },
    3:{
        iof:functions.constant(3),
        inputs:{},
        x:2,
        y:6
    }
}
setUpView();

scenarios.add({
    funcs:_.values(functions),
    editor:{
        name:"An Example",
        doc:"An example description",
        tests:{},
        body:s
    },
    name:"An Example"
})

var newEditor = (function () {
    return {name:"New Editor",
        doc:"",
        tests:{},
        body:{}
    }
});

scenarios.add({
    funcs:_.values(functions),
    editor:newEditor(),
    name:"Playground"
})

editorController.getEditorState().insertFunction(functions.minus());
editorController.getEditorState().insertFunction(functions.ifc());
editorController.getEditorState().insertFunction(functions.constant(0));
editorController.getEditorState().insertFunction(functions.constant(1));
editorController.getEditorState().insertFunction(functions.constant(1));
editorController.getEditorState().insertFunction(functions.constant("input"));
editorController.getEditorState().insertFunction(functions.equals());
editorController.getEditorState().insertFunction(functions.mul());