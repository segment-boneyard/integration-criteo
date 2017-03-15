/**
 * Module dependencies.
 */

var Batch = require('batch');
var integration = require('segmentio-integration');
var mapper = require('./mapper');
var countryMapper = require('./countryRegionMapping');

/**
 * Expose `Criteo`
 */

var Criteo = module.exports = integration('Criteo')
  .endpoint('http://widget.')
  .channels(['server'])
  .ensure('message.context.device.advertisingId')
  .ensure('message.context.app.namespace')
  .mapper(mapper)
  .retries(3);


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
  var locale = countryMapper(track);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(track)
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
  var locale = countryMapper(payload);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(payload)
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
  var locale = countryMapper(payload);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(payload)
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
  var locale = countryMapper(payload);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(payload)
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
  var locale = countryMapper(payload);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(payload)
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
  var locale = countryMapper(payload);

  self
    .post(locale + '.criteo.com/m/event?')
    .set('User-Agent', 'Segment.io/1.0.0')
    .send(payload)
    .end(self.handle(cb));
};
