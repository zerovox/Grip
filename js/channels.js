define(['backbone','underscore'], function (Backbone, _) {
    function newChannel() {
        return _.extend({}, Backbone.Events);
    }

    return {
        scenarios : newChannel(),
        editors   : newChannel(),
        tests     : newChannel(),
        map       : newChannel(),
        tasks     : newChannel(),
        debug     : newChannel()
    }
});