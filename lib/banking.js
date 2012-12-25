var parser = require('xml2json');
var request = require('request');

var uuid = require('./uuid');

/**
 * Turn Ofx string into valid XML then parse to json if requested
 *
 * @param {String} ofxData
 * @param {String} format (Options are 'xml' || 'json' if omitted defaults to 'json')
 * @param {Function} cb
 * @return {XML|JSON}
 * @api public
 */

var parseOfxString = exports.parseOfxString = function (ofxData, format, cb) {
  if (typeof format !== 'string') {
    cb = format;
    format = 'json';
  }

  var ofx = ofxData.split('<OFX>',2);
  var headerString = ofx[0].split(/\r|\n/);
  var bodyXML = ('<OFX>'+ofx[1]).replace(/>\s+</g, '><').replace(/\s+</g, '<').replace(/>\s+/g, '>').replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, '<\$1\$2>\$3' ).replace(/<(\w+?)>([^<]+)/g, '<\$1>\$2</\$1>');
  var header = {};

  for(var attrs in headerString){
    var headAttributes = headerString[attrs].split(/:/,2);
    header[headAttributes[0]] = headAttributes[1];
  }

  var body = (format === 'json') ? JSON.parse(parser.toJson(bodyXML)) : bodyXML;
  cb(null, body);
};

exports.getAccounts = function() {
  var ofxReq = 'OFXHEADER:100\n'+
               'DATA:OFXSGML\nVERSION:102\nSECURITY:NONE\nENCODING:USASCII\nCHARSET:1252\nCOMPRESSION:NONE\nOLDFILEUID:NONE\nNEWFILEUID:'+uuid(32)+'\n\n'+
               '<OFX>'+
               '<SIGNONMSGSRQV1>'+
               '<SONRQ>'+
               '<DTCLIENT>'+o.date_end+
               '<USERID>'+o.user+
               '<USERPASS>'+o.pass+
               '<LANGUAGE>ENG'+
               '<FI>'+
               '<ORG>'+o.fidorg+
               '<FID>'+o.fid+
               '</FI>'+
               '<APPID>QWIN'+
               '<APPVER>' + '1900' +
               '</SONRQ></SIGNONMSGSRQV1>'+

               '<SIGNUPMSGSRQV1>' +
               '<ACCTINFOTRNRQ><TRNUID>' + uuid(32) +
               '<ACCTINFORQ><DTACCTUP>20121201</ACCTINFORQ>' +
               '</ACCTINFOTRNRQ></SIGNUPMSGSRQV1>' +
               '</OFX>';
};


/**
 * Fetches Ofx String from Bank Server and parse to json or returns valid XML
 *
 * @param {JSON} o Request Config Settings
 * @param {String} format (Options are 'xml' || 'json' if omitted defaults to 'json')
 * @param {Function} cb
 * @return {XML|JSON}
 * @api public
 */

exports.getStatement = function(o, format, cb) {
  if (typeof format !== 'string') {
    cb = format;
    format = 'json';
  }

  var ofxReq = 'OFXHEADER:100\n'+
               'DATA:OFXSGML\nVERSION:102\nSECURITY:NONE\nENCODING:USASCII\nCHARSET:1252\nCOMPRESSION:NONE\nOLDFILEUID:NONE\nNEWFILEUID:'+uuid(32)+'\n\n'+
               '<OFX>'+
               '<SIGNONMSGSRQV1>'+
               '<SONRQ>'+
               '<DTCLIENT>'+o.date_end+
               '<USERID>'+o.user+
               '<USERPASS>'+o.pass+
               '<LANGUAGE>ENG'+
               '<FI>'+
               '<ORG>'+o.fidorg+
               '<FID>'+o.fid+
               '</FI>'+
               '<APPID>QWIN'+
               '<APPVER>' + '1900' +
               '</SONRQ></SIGNONMSGSRQV1>'+

               '<BANKMSGSRQV1>'+
               '<STMTTRNRQ>'+
               '<TRNUID>'+uuid(32)+
               '<CLTCOOKIE>'+uuid(5)+
               '<STMTRQ>'+
               '<BANKACCTFROM>'+
               '<BANKID>'+o.bankid+
               '<ACCTID>'+o.accid+
               '<ACCTTYPE>'+o.acctype+
               '</BANKACCTFROM>'+
               '<INCTRAN>'+
               '<DTSTART>'+o.date_start+
               '<INCLUDE>Y</INCTRAN>'+
               '</STMTRQ>'+
               '</STMTTRNRQ>'+
               '</BANKMSGSRQV1>'+

               '</OFX>';


  var opt = {
      method: 'POST'
    , url: o.url
    , headers: { 'Content-Type' : 'application/x-ofx' }
    , body: ofxReq
    , encoding: 'UTF8'
  };

  request(opt, function(err, res, body){
    if (err) {
      return cb(err);
    }

    if( res.headers['content-type'] === 'text/html' ) {
      return cb(new Error('Expected: application/ofx or plain/text, Received: ' + res.headers['content-type']));
    };

    if( format == 'ofx' ) {
      return cb(null, body);
    }

    parseOfxString(body, format, cb);
  });
};
