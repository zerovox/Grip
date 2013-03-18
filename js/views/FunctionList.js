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
            this.name = _.first(this.groups).name
            this.render()

            //Hack: This lets us wait till the DOM has finished loading before re-drawing the canvas.
            //The images will be correct without this line, but the onClick handlers might not be calibrated to the page offset correctly.
            //We only need to do this for the initial draw when the browser is busy.
            setTimeout(_.bind(this.listView.show, this), 0)

        },
        makeActive     : function (name) {
            _.find(this.groups,function (obj) {return obj.active}).active = false;
            _.find(this.groups,function (obj) {return name === obj.name}).active = true;
            this.groupView = new GroupView(this.groups)
            this.name = name
            this.render()
        },
        render         : function () {
            if (this.name === "LocalFunctions")
                this.listView.set(this.locals)
            else
                this.listView.set(this.list.where({group : this.name}))
        },
        removeChildren : function () {
            this.groupView.remove()
            setTimeout(_.bind(this.listView.show, this), 0)
        }
    });

})
;