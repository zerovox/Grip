require([
    'chai',
    'mocha'
], function (chai, mocha) {
    assert = chai.assert;
    should = chai.should();
    expect = chai.expect;

    chai.Assertion.includeStack = true;

    //TODO: Rewrite these in terms of asserts to get pretty error messages instead of nasty traces.
    chai.use(function (chai, utils) {
        var Assertion = chai.Assertion;

        utils.addMethod(Assertion.prototype, 'interface', function(a){
            var obj = this._obj;
            for(var i in a){
                obj.should.have.property(a[i])
            }
        })

        utils.addChainableMethod(Assertion.prototype, 'attributes', function(a){
            var obj = this._obj;
            for(var i in a){
                this.assert(obj.has(a[i]), 'Attribute ' + a[i] + ' not found', 'Attribute ' + a[i] + ' found')
            }
        })
    });

    mocha.setup('bdd')

    require(['tests/mc', 'tests/primitives'], function(){
        mocha.run();
    });
});