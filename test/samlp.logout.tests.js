var expect = require('chai').expect;
var server = require('./fixture/server');
var request = require('request');
var cheerio = require('cheerio');
var xmldom = require('xmldom');
var zlib = require('zlib');

describe('samlp logout', function () {
  before(function (done) {
    server.start( { 
      audience: 'https://auth0-dev-ed.my.salesforce.com'
    },done);
  });

  after(function (done) {
    server.close(done);
  });

  var body, $, signedAssertion, logoutResultValue;

  beforeEach(function (done) {
    request.get({
      jar: request.jar(), 
      uri: 'http://localhost:5050/samlp?SAMLRequest=fZJbc6owFIX%2FCpN3EAEVMmIHEfDaqlCP%2BtKJELkUEkqCl%2F76Uj3O9JyHPmay9l4r%2BVb%2F6VLkwglXLKXEBG1JBgImIY1SEpvgNXBFHTwN%2BgwVeQmtmidkjT9qzLjQzBEGbxcmqCsCKWIpgwQVmEEeQt9azKEiybCsKKchzYFgMYYr3hjZlLC6wJWPq1Ma4tf13AQJ5yWDrVZO45RIDOWYHWkVYimkBRBGjWVKEL%2BlfEhDSjhlVEJNLvlb1%2FqOA4TJyARvynPH80qFFJPAdg%2Fh1fNnGVqpKO3OLkZonUfJ0Nu2Y2t6PdlVPj1RZxVlThywI8rihVH0MuksTQz3sx1Fm2xv5LO9nYSs5KXxfnm364%2FwfMDPWMqn182qHOqpjzR0dncsM6xO1Vs7h860HI97yrB7xHE9dt2loy%2FQu1prie%2FMcuNNL2i6nUdWp%2Fdnk3yekb7dXYhWjFjil%2Br2IC%2Bd%2FexlNF7wS77Zomvo7epFbCuyVx5tq3klYzWeEMYR4SZQ5LYqypqo6IGiQE2FmiKpencPhOXf%2Fx%2Bm5E71N1iHu4jBcRAsxeWLHwBh82hHIwD3LsCbefWjBL%2BvRQ%2FyYPCAd4MmRvgk4kgqrv8R77d%2B2Azup38LOPgC&RelayState=123'
    }, function (err, response, b){
      if(err) return done(err);
      expect(response.statusCode)
        .to.equal(200);

      body = b;
      $ = cheerio.load(body);
      var SAMLResponse = $('input[name="SAMLResponse"]').attr('value');
      var decoded = new Buffer(SAMLResponse, 'base64').toString();
      signedAssertion = /(<saml:Assertion.*<\/saml:Assertion>)/.exec(decoded)[1];
      done();
    });
  });

  describe('SP initiated - Redirect binding (GET)', function () {
    // SAMLRequest: base64 encoded + deflated + URLEncoded
    // Signature: URLEncoded
    // SigAlg: URLEncoded

    // <samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="samlr-220c705e-c15e-11e6-98a4-ecf4bbce4318" IssueInstant="2016-12-13T18:01:12Z" Version="2.0">
    //   <saml:Issuer>https://foobarsupport.zendesk.com</saml:Issuer>
    //   <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">foo@example.com</saml:NameID>
    //   <saml:SessionIndex>1</saml:SessionIndex>
    // </samlp:LogoutRequest>
    before(function (done) {
      request.get({
        jar: request.jar(),
        followRedirect: false,
        uri: 'http://localhost:5050/logout?SAMLRequest=fZFBS8NAEIXvhf6HsPdNM2mtdWiDhSIEqgdbPHjbbqYazO7GnQ0Uf73bVDAKetnDm%2B%2FNm8cuWZmmxa17cV14pPeOOCQn01jGfrISnbfoFNeMVhliDBp36%2Fst5mmGrXfBadeIgeV%2Fh2ImH2pnRVJuVuJs8DLPM32dXZHUEB8AmsubhZpJ0sfZ4aBpNoVF5Jk7Ki0HZcNK5BnMJeQSpntYYAYI%2BbNInshzXB7HaSaK8ShJlucI7L2%2BeA2hZZxMjs4dlOeubZ0P6QfZivgt1c4sJ0P82%2F8Qi5Sb5M55o8LfDSGFXqkreexRJKPqZl1VnphFEXNv6aRM29Ag7bJ8kLaLcGxRxrNOBXxRP8Tx6KL%2B%2BrniEw%3D%3D&Signature=KH%2FBMO0DJyS2Ffy%2B6Rnb11pAF37Y%2Beua7RHcFhVrwgxJEqsx59vTelrfPt771JPfr7%2BoG1uYwwO3Algs59yTeqmU35x18Bf2e0yWugqEF7wxHETCjrwbCK1YjYg0ilwCojk%2FBTTv2Rs%2BY7RB21Ou1GShT1uXv8WItj7E2qnr%2B6kHY5XJWTJukZa9Vnkx%2FiisA7n6UfnnGcWMdltYeOvyHvOFMVG43dDxBms9WKMKdxn6NJ7i2V1v7nXj1DoXD4PDH5B6aevkA49c6mpzozyXKLeXLys%2FvPNNT4cC1jmWvuen5pe%2FE1WfgcZcZvj2GGaxs36fdH%2FHsIcyDvE%2Bj7ngYw%3D%3D&RelayState=123&SigAlg=http%3A%2F%2Fwww.w3.org%2F2000%2F09%2Fxmldsig%23rsa-sha1'
      }, function (err, response){
        if(err) return done(err);
        expect(response.statusCode).to.equal(302);
        var qs = require('querystring');
        var i = response.headers.location.indexOf('SAMLResponse=');
        var SAMLResponse = qs.parse(response.headers.location.substr(i)).SAMLResponse;
        
        zlib.inflateRaw(new Buffer(SAMLResponse, 'base64'), function (err, decodedAndInflated) {
          if(err) return done(err);
          signedAssertion = /(<samlp:StatusCode.*\/>)/.exec(decodedAndInflated)[1];
          var doc = new xmldom.DOMParser().parseFromString(signedAssertion);
          logoutResultValue = doc.documentElement.getAttribute('Value');

          done();
        });
      });
    });

    it('should respond with a Success value', function () {
      expect(logoutResultValue).to.equal('urn:oasis:names:tc:SAML:2.0:status:Success');
    });
  });

  // IdP Initiated with no Session Participants should not happen
  // At least we should have 1 session participant. Still should not return an error
  describe('IdP initiated', function () {
    var body;
    before(function (done) {
      request.get({
        jar: request.jar(),
        followRedirect: false,
        uri: 'http://localhost:5050/logout'
      }, function (err, response) {
        if(err) return done(err);
        expect(response.statusCode).to.equal(200);
        body = response.body;

        done();
      });
    });

    it('should respond with a Success value', function () {
      expect(body).to.equal('OK');
    });
  });
});