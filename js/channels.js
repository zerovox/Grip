define(['backbone','underscore'], function (Backbone, _) {
    function newChannel() {
        return _.extend({}, Backbone.Events);
    }

    return {
        scenarios : newChannel(),
        editors   : newChannel(),
        debug     : newChannel()
    }
});