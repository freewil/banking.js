var assert = require('assert');

var banking = require('../lib/banking');
var data = require('./fixtures/data');

test('valid statement', function(done) {
  var bankInfo = {
    fid: 321081669
    , fidorg: 'DI'
    , url: 'https://ofxdi.diginsite.com/cmr/cmr.ofx'
    , bankid: 321081669
    , user: 'someusername'
    , pass: 'somepassword'
    , accid: 12345678901
    , acctype: 'CHECKING'
    , date_start: 20010125
    , date_end: 20110125
  }

  banking.getStatement(bankInfo, function (err, res) {
    assert.ifError(err);

    assert.equal(typeof res, 'object');
    assert.ok(res.OFX);
    done();
  });
});

test('parse Ofx string', function(done) {

  banking.parseOfxString(data.ofxString, function (err, res) {
    assert.ifError(err);
    assert.equal(typeof res, 'object');
    assert.ok(res.OFX);
    done();
  });
});
