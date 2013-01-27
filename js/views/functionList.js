define([
    'backbone',
    'underscore',
    'views/FabricFunctionList',
    'views/FunctionGroupView'
], function (Backbone, _, FabricFunctionList, GroupView) {

    return Backbone.View.extend({
        initialize : function () {
            this.listView = new FabricFunctionList()
            this.groupView = new GroupView()
            //this.categories
        },
        set        : function (functionsCollection) {
            this.groups = []
            _.each(_.uniq(functionsCollection.pluck("group")), function (name) {
                this.groups.push({name : name, active : false})
            }, this);
            _.first(this.groups).active = true
            this.list = functionsCollection
            this.render()
        },
        makeActive : function(name){
            _.find(this.groups, function(obj){return obj.active}).active = false
            _.find(this.groups, function(obj){return name === obj.name}).active = true;
            this.render()
        },
        render     : function () {
            this.listView.set(this.list.where({group : _.find(this.groups, function(obj){return obj.active}).name}))
            this.groupView.set(this.groups)
        },
        hide       : function () {
            this.listView.hide()
            this.groupView.hide()
        },
        show       : function () {
            this.listView.show()
            this.groupView.show()
        }
    });

})
;