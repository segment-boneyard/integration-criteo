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
  var namePostfix = msg.proxy('context.Criteo.namePostfix');
  var namespace = app.namespace;
  var siteType;

  if (os.name === 'Android') {
    siteType = 'aa';
    deviceId = { 'gaid': deviceId };
  } else {
    siteType = 'aios';
    deviceId = { 'idfa': deviceId };
  }

  if (namePostfix) {
    namespace = namespace + '.' + namePostfix;
  }

  return {
    account: {
      an: namespace,
      cn: lower(locale),
      ln: lower(language)
    },
    site_type: siteType,
    id: deviceId,
    version: 's2s_v1.0.0'
  };
};

/**
 * Add dates to payload
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

var addDates = function(track) {
  var props = track.properties();
  var dateIn;
  var dateOut;

  // Hotel Dates
  if (props.checkin_date) {
    dateIn = props.checkin_date;
    dateOut = props.checkout_date;
  // Flight dates
  } else if (props.flights) {
    var flights = props.flights
    dateIn = flights[0].departure_date;
    dateOut = flights[1].departure_date;
  } else if (props.departure_date) {
    dateIn = props.departure_date;
    dateOut = props.departure_date;
  // Car Rental Dates
  } else if (props.pickup_date) {
    dateIn = props.pickup_date;
    dateOut = props.dropoff_date;
  }

  if (dateIn && dateOut) {
    return {
      "event": "vs",
      "din": formatDate(dateIn),
      "dout": formatDate(dateOut)
    };
  }
};


/**
 * Format Dates for Criteo Endpoint Requirements
 *
 * @param {Timestamp} date
 * @return {String}
 * @api private
 */

var formatDate = function(date){
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Generate Email event
 *
 * @param {String} email
 * @return {Object}
 * @api private
 */

var generateEmailEvent = function(email){
  if (email) {
  	return {
  		"event": "setHashedEmail",
  		"email": [md5(email)]
  	}; 
  }
}

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
  var emailEvent = generateEmailEvent(email);
  var dateEvent = addDates(track);
  var eventsPayload = reject([event].concat(emailEvent, dateEvent));
  if (eventsPayload.length === 1) {
    eventsPayload = eventsPayload[0];
  }

  return { events: eventsPayload };
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
