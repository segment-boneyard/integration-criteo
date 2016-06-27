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
  .endpoint('http://widget.us.criteo.com/m/event?data=')
  .ensure('settings.token')
  .channels(['server'])
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

  var body = {
    event: track.event(),
    properties: track.properties(),
    token: this.settings.token
  };

  self
    .post(endpoint)
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(body)
    .end(self.handle(cb));
};
