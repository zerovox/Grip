define([
    'backbone',
    'underscore',
    'views/fabric/FunctionList',
    'views/FunctionGroupView'
], function (Backbone, _, FabricFunctionList, GroupView) {

    return Backbone.View.extend({
        initialize     : function (functionsCollection, editorCollection) {
            this.listView = FabricFunctionList
            this.listView.show()
            this.groups = []
            _.each(_.uniq(functionsCollection.pluck("group")), function (name) {
                this.groups.push({name : name, active : false})
            }, this);
            this.groups.push({name : "LocalFunctions", active : false})
            _.first(this.groups).active = true
            this.list = functionsCollection
            this.locals = editorCollection
            this.groupView = new GroupView(this.groups)
            this.render(_.first(this.groups).name)
        },
        makeActive     : function (name) {
            _.find(this.groups,function (obj) {return obj.active}).active = false;
            _.find(this.groups,function (obj) {return name === obj.name}).active = true;
            this.groupView = new GroupView(this.groups)
            this.render(name)
        },
        render         : function (name) {
            if (name === "LocalFunctions")
                this.listView.set(this.locals)
            else
                this.listView.set(this.list.where({group : name}))

            this.listView.show()

        },
        removeChildren : function () {
            this.groupView.remove()
            this.listView.remove()
        }
    });

})
;