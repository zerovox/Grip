define([
    'backbone',
    'mustache',
    'libs/text!templates/taskList.html'
], function (Backbone, Mustache, TestListTemplate) {

    return Backbone.View.extend({
        el         : '#taskModal',
        initialize : function (testCollection) {
            this.tasks = []
        },
        runTest    : function (test, editor, functions){
          var arguments = test.get("inputs")
          var output    = test.get("output")
          var test = { name : editor.get("name"), inputs : arguments, output : output, status : "running"}
          this.tasks.push(test)
            // TODO: spawn worker to run the test, set it to only send back success or fail events, nothing inbetween.
          this.render();
        },
        render     : function () {
            //TODO: Rerender on display
            var html = Mustache.render(TestListTemplate, {tasks : this.tasks});
            this.$el.html(html);
        }
    });

});