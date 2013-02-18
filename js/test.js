require([
    'chai',
    'mocha'
], function (chai, mocha) {
    assert = chai.assert;
    should = chai.should();
    expect = chai.expect;

    mocha.setup('bdd')

    require(['tests/run'], function(){
        mocha.run();
    });
});