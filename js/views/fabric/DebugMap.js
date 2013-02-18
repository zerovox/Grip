define([
    'backbone',
    'views/fabric/MapCore'
], function (Backbone, MapCore) {

    return Backbone.View.extend(_.extend(new MapCore(), {
        el                  : "#debugMap",
        maxHeightPercentage : 1,
        onWired             : function (inp, out, wire) {
            if (typeof inp.func !== "undefined") {
                var status = inp.func.functionModel.inputs[inp.name]
                console.log(status)
                if (status.requested) {
                    if (status.responded) {
                        console.log(wire)
                        wire.fill = "rgb(43,166,203)"
                        wire.setShadow({ color : 'rgba(3,166,203,0.9)', offsetX : 0, offsetY : 0, blur : 10});
                        var text = new fabric.Text(""+status.result, {
                            fontSize: 14,
                            left: wire.left,
                            top: wire.top - 6,
                            lineHeight: 1,
                            fontFamily: 'Helvetica',
                            fontWeight: 'bold'
                        });
                        this.canvas.add(text);

                    } else {
                        wire.fill = "rgb(192,15,19)"
                        wire.setShadow({ color : 'rgba(192,15,19,0.9)', offsetX : 0, offsetY : 0, blur : 10});
                    }
                } else {
                    wire.set({strokeDashArray: [5, 5, 3]})
                }
            } else {
                //We always request the output
                //TODO: Check this doesn't break recursives
                //TODO: We need more information on this, on finish we should show this as a
                wire.fill = "rgb(192,15,19)"
                wire.setShadow({ color : 'rgba(192,15,19,0.9)', offsetX : 0, offsetY : 0, blur : 10});
            }
        },
        onNewFunction       : function (f, func, box) {
            console.log(box)
            box.lockMovementX = box.lockMovementY = true;
            box.functionModel = func
            if("debugString" in func && typeof func.debugString !== "undefined"){
                console.log(func.debugString)
                var text = new fabric.Text(func.debugString, {
                    fontSize: 14,
                    left: box.left,
                    top: box.top + 14 + (box.height/2),
                    lineHeight: 1,
                    fontFamily: 'Helvetica',
                    fontWeight: 'bold'
                });
                this.canvas.add(text);
            }
        }

    }))
});