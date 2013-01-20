define([
    'backbone',
    'mustache',
    'libs/text!templates/groupList.m'
], function (Backbone, Mustache, GroupList) {

    return Backbone.View.extend({
        el         : "#functionMenu",
        set        : function (groups) {
            this.groups = groups
            this.render()
        },
        render     : function () {
            var html = Mustache.render(GroupList, {groups : this.groups});
            this.$el.html(html);
        }
    });

})
;