define(['backbone','underscore'], function (Backbone, _) {
    function newChannel() {
        return _.extend({}, Backbone.Events);
    }

    return {
        debug     : newChannel()
    }
});