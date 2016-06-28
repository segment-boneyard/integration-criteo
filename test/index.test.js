var Criteo = require('..');
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var mapper = require('../lib/mapper');

describe('Criteo', function(){
  var settings;
  var criteo;
  var test;

  beforeEach(function(){
    settings = {
      appId: '654757884637545'
    };
  });

  beforeEach(function(){
    criteo = new Criteo(settings);
    test = Test(criteo, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Criteo')
      .endpoint('http://widget.us.criteo.com/')
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
    });
  });

  describe('track', function(){
    it('should track basic correctly', function(done){
      var data = test.fixture('track-basic');
      test
        .track(data.input)
        .query(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Opened correctly', function(done){
      var data = test.fixture('track-app-opened');
      test
        .track(data.input)
        .query(data.output)
        .expects(200)
        .end(done);
    });

    it('should track Application Opened with Email correctly', function(done){
      var data = test.fixture('track-app-opened-w-email');
      test
        .track(data.input)
        .query(data.output)
        .expects(200)
        .end(done);
    });
  });
});