define([
    'backbone',
    'views/fabric/MapCore'
], function (Backbone, MapCore) {

    return Backbone.View.extend(_.extend(new MapCore(), {
        el          : "#debugMap",
        maxHeightPercentage : 1,
        onWired : function(func, func2, wire){
            if (func !== undefined && func.functionModel !== undefined) {
                if (func2 !== undefined && func2.functionModel !== undefined) {
                    if (func.functionModel.active && func2.functionModel.active) {
                        wire.fill = "red"
                    }
                }
            } else {
                if (func2 !== undefined && func2.functionModel !== undefined) {
                    if (func2.functionModel.active) {
                        wire.fill = "red"
                    }
                }
            }
        },
        onNewFunction : function(f, func, box){
            box.lockMovementX = box.lockMovementY = true;
        }

    }))
});