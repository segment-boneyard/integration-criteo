'use strict';

/**
 * Module dependencies.
 */

var Track = require('segmentio-facade').Track;
var extend = require('extend');
var foldl = require('@ndhoule/foldl');
var reject = require('reject');
var md5 = require('md5');
var moment = require('moment');
var lower = require('lower-case');

/**
 * Format Dates for Criteo Endpoint Requirements
 *
 * @param {Timestamp} date
 * @return {String}
 * @api private
 */

var formatDate = function(date){
  return moment(date).format('YYY-MM-DD');
}

/**
 * Generate Email event
 *
 * @param {String} email
 * @return {Object}
 * @api private
 */

var generateEmailEvent = function(email){
	return {
		"event": "setHashedEmail",
		"email": [md5(email)]
	};
}

/**
 * Generate top level properties for all messages
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

var topLevelProperties = function(msg){
  var app = msg.proxy('context.app');
  var os = msg.proxy('context.os');
  var device = msg.proxy('context.device');
  var deviceId = device.id;
  var languageLocale = msg.proxy('context.locale').split('-');
  var language = languageLocale[0];
  var locale = languageLocale[1];
  var siteType;

  if (os.name === 'Android') {
  	siteType = 'aa';
    deviceId = { 'gaid': deviceId };
  } else {
  	siteType = 'aios';
  	deviceId = { 'idfa': deviceId };
  }

  return {
  	account: {
      an: app.namespace,
      cn: lower(locale),
      ln: lower(language)
  	},
    site_type: siteType,
    id: deviceId,
    version: 's2s_v1.0.0'
  };
};

/**
 * Generate events array
 *
 * @param {Track} track
 * @param {Object} event
 * @return {Object}
 * @api private
 */

var generateEventsObject = function(track, event) {
  var email = track.email();
  var eventsObject = event;
  if (email) {
    var eventsArray = [eventsObject];
    eventsArray.push(generateEmailEvent(email));
    return { events: eventsArray }
  }
  return { events: eventsObject };
};

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track) {
  var userId = track.userId();
  var email = track.email();
  var event = extend(
    {
      event: 'vs',
      ci: userId
    },
    track.properties()
  );

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
};

/**
 * Map Application Opened.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.applicationOpened = function(track) {
  var userId = track.userId();
  var event = {
    event: 'viewHome',
    ci: userId
  };

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
}

/**
 * Map Product List Viewed.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.productListViewed = function(track) {
  var userId = track.userId();
  var products = track.products();
  var productIds = foldl(function(results, product) {
    return results.concat(product.id);
  }, [], products);

  var event = {
    event: 'viewListing',
    ci: userId,
    product: productIds
  };

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
}

/**
 * Map Product Viewed.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.productViewed = function(track) {
  var userId = track.userId();
  var productId = track.proxy('properties.productId') || track.id();

  var event = {
    event: 'viewProduct',
    ci: userId,
    product: productId
  };

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
}

/**
 * Map Cart Viewed.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.cartViewed = function(track) {
  var userId = track.userId();
  var currency = track.currency();
  var products = track.products();
  var productObjects = foldl(function(results, product) {
    return results.concat(reject({ 
      id: product.productId,
      price: product.price,
      quantity: product.quantity
      }));
  }, [], products);

  var event = {
    event: 'viewBasket',
    ci: userId,
    currency: currency,
    product: productObjects
  };

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
}

/**
 * Map Order Completed.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.orderCompleted = function(track) {
  var userId = track.userId();
  var currency = track.currency();
  var products = track.products();
  var productObjects = foldl(function(results, product) {
    return results.concat(reject({ 
      id: product.id,
      price: product.price,
      quantity: product.quantity
      }));
  }, [], products);

  var event = {
    event: 'trackTransaction',
    ci: userId,
    currency: currency,
    product: productObjects
  };

  return reject(extend(
    topLevelProperties(track),
    generateEventsObject(track, event)
  ));
}

/**
 * Map page.
 *
 * @param {Page} page
 * @return {Object}
 * @api private
 */

exports.page = function(page) {
  return page;
};

/**
 * Map screen.
 *
 * @param {Screen} screen
 * @return {Object}
 * @api private
 */

exports.screen = function(screen) {
  return screen;
};
