define([
    'backbone',
    'primitives'
], function (Backbone, primitives) {

    return Backbone.Model.extend({
        initialize : function (fName, extra) {
            //Extra holds a pointer to the collection it is being initilized in, could be used as a way to hold primitives in one place
            var func = _.find(primitives, function (prim) {return prim.name === fName})
            this.set({func : func, group : func.group})
        }});

});