require([
    'underscore',
    'jquery',
    'chai',
    'mocha'
], function (_, $, chai) {
    assert = chai.assert;
    should = chai.should();
    expect = chai.expect;

    mocha.setup('bdd')

    require(['tests/run'], function(){
        mocha.run();
    });
});