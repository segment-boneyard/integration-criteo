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
  var namespace = msg.proxy('context.app.namespace');
  var osName = msg.proxy('context.os.name');
  var device = msg.proxy('context.device');
  var languageLocale = msg.proxy('context.locale').split('-');
  var language = languageLocale[0];
  var locale = languageLocale[1];
  var namePostfix = msg.proxy('context.Criteo.namePostfix');
  var ret = {
    account: {
      an: namespace,
      cn: lower(locale),
      ln: lower(language)
    },
    version: 's2s_v1.0.0'
  };

  if (osName === 'Android') {
    ret.site_type = 'aa';
    ret.id = { gaid: device.advertisingId };
  } else {
    ret.site_type = 'aios';
    ret.id = { idfa: device.advertisingId };
  }

  if (namePostfix) {
    ret.account.an = namespace + '.' + namePostfix;
  }

  return ret;
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

var generateEmailAlternateIDs = function(email) {
    return {
      alternate_ids: [
        { type: "email", value: md5(email), hash_method: "md5" }
      ]
    };
}

var generateAlternateIDs = function(track) {
  var email = track.email();
  if (email) {
    return generateEmailAlternateIDs(email);
  }
  return { };
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
  var dateEvent = addDates(track);
  var eventsPayload = reject([event].concat(dateEvent));
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
  var event = extend(
    {
      event: 'vs',
      ci: userId
    },
    track.properties()
  );

  return reject(extend(
    topLevelProperties(track),
    generateAlternateIDs(track),
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
    generateAlternateIDs(track),
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
    var item = new Track({ properties: product });
    var id = item.productId() || item.id();
    return results.concat(id);
  }, [], products);

  var event = {
    event: 'viewListing',
    ci: userId,
    product: productIds
  };

  return reject(extend(
    topLevelProperties(track),
    generateAlternateIDs(track),
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
  var productId = track.productId() || track.id();

  var event = {
    event: 'viewProduct',
    ci: userId,
    product: productId
  };

  return reject(extend(
    topLevelProperties(track),
    generateAlternateIDs(track),
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
    var item = new Track({ properties: product });
    var id = item.productId() || item.id();
    return results.concat(reject({
      id: id,
      price: item.price(),
      quantity: item.quantity()
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
    generateAlternateIDs(track),
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
    var item = new Track({ properties: product });
    var id = item.productId() || item.id();
    return results.concat(reject({
      id: id,
      price: item.price(),
      quantity: item.quantity()
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
    generateAlternateIDs(track),
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
