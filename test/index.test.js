var Criteo = require('..');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var mapper = require('../lib/mapper');
var sinon = require('sinon');

describe('Criteo', function(){
  var settings;
  var criteo;
  var test;
  var sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
    settings = {
      appId: '654757884637545'
    };
  });

  beforeEach(function(){
    criteo = new Criteo(settings);
    test = Test(criteo, __dirname);
    test.mapper(mapper);
    sandbox.restore();
  });

  it('should have the correct settings', function(){
    test
      .name('Criteo')
      .endpoint('http://widget.')
      .channels(['server']);
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Character Upgraded',
        timestamp: new Date(),
        context: {
          app: {
            namespace: 'com.Segment.testApp',
            version: 1.0
          },
          device: {
            type: 'ios',
            advertisingId: '123456',
            adTrackingEnabled: 1
          }
        }
      };
    });

    it('should be invalid when .advertisingId is missing', function(){
      delete msg.context.device.advertisingId;
      test.invalid(msg, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){
    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });

      it('should map application opened', function(){
        test.maps('track-app-opened');
      });

      it('should map application opened with email', function(){
        test.maps('track-app-opened-w-email');
      });

      it('should map product list viewed', function(){
        test.maps('track-product-list-viewed');
      });

      it('should map product viewed', function(){
        test.maps('track-product-viewed');
      });

      it('should map cart viewed', function(){
        test.maps('track-cart-viewed');
      });

      it('should map order completed', function(){
        test.maps('track-order-completed');
      });

      it('should map events with dates correctly', function(){
        test.maps('track-date');
      });

      it('should map events with correct country codes', function(){
        test.maps('track-country');
      });

      it('should map events with a name postfix', function(){
        test.maps('track-namespace-postfix');
      });
    });
  });

  describe('track', function(){
    it('should track basic correctly', function(done){
      var data = test.fixture('track-basic');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Opened correctly', function(done){
      var data = test.fixture('track-app-opened');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Opened with Email correctly', function(done){
      var data = test.fixture('track-app-opened-w-email');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Product List Viewed correctly', function(done){
      var data = test.fixture('track-product-list-viewed');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Product Viewed correctly', function(done){
      var data = test.fixture('track-product-viewed');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Cart Viewed correctly', function(done){
      var data = test.fixture('track-cart-viewed');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Order Completed correctly', function(done){
      var data = test.fixture('track-order-completed');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track dates correctly', function(done){
      var data = test.fixture('track-date');
      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(done);
    });

    it('should track events to the right data center', function(done){
      var data = test.fixture('track-country');
      var spy = sandbox.spy(criteo, 'get');

      test
        .track(data.input)
        .sends(data.output)
        .expects(200)
        .end(function(err, res) {
          assert(res[0].request.url === 'http://widget.eu.criteo.com/m/event?');
          done();
        });
    });
  });
});
