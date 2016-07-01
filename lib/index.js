/**
 * Module dependencies.
 */

var Batch = require('batch');
var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Criteo`
 */

var Criteo = module.exports = integration('Criteo')
  .endpoint('http://widget.us.criteo.com/')
  .channels(['server'])
  .mapper(mapper)
  .retries(3);


/**
 * Ensure there's an advertiser id
 */

Criteo.ensure(function(msg){
  var device = msg.proxy('context.device') || {};
  if (device.advertisingId) return;
  return this.invalid('All calls must have an Advertiser Id');
});

/**
 * Track.
 *
 * https://segment.com/docs/spec/track/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.track = function(track, cb) {
  var self = this;

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(track)
    .end(self.handle(cb));
};

/**
 * Application Opened
 *
 * https://segment.com/docs/spec/mobile/#application-opened
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.applicationOpened = function(track, cb) {
  var self = this;
  var payload = mapper.applicationOpened(track);

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(payload)
    .end(self.handle(cb));
};

/**
 * Product List Viewed
 *
 * https://segment.com/docs/spec/ecommerce/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.productListViewed = function(track, cb) {
  var self = this;
  var payload = mapper.productListViewed(track);

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(payload)
    .end(self.handle(cb));
};

/**
 * Product Viewed
 *
 * https://segment.com/docs/spec/ecommerce/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.productViewed = function(track, cb) {
  var self = this;
  var payload = mapper.productViewed(track);

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(payload)
    .end(self.handle(cb));
};

/**
 * Cart Viewed
 *
 * https://segment.com/docs/spec/ecommerce/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.cartViewed = function(track, cb) {
  var self = this;
  var payload = mapper.cartViewed(track);

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(payload)
    .end(self.handle(cb));
};

/**
 * Order Completed
 *
 * https://segment.com/docs/spec/ecommerce/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Criteo.prototype.orderCompleted = function(track, cb) {
  var self = this;
  var payload = mapper.orderCompleted(track);

  self
    .post('m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(payload)
    .end(self.handle(cb));
};
