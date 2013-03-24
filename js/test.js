require([
    'chai',
    'mocha'
], function (chai, mocha) {
    assert = chai.assert;
    should = chai.should();
    expect = chai.expect;

    chai.Assertion.includeStack = true;

    mocha.setup('bdd')

    require(['tests/run'], function(){
        mocha.run();
    });
});