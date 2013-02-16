define([],function(){

    var O = function() {return {name : "Joe"}}
    describe('Person', function(){

        it('should have a name by default', function() {
            new O().name.should.equal('Joe');
        });

        it('should allow a name to be set on creation', function() {
            new O('Francis').name.should.equal('Francis');
        });


    });

});