'use strict';

/**
 * Module dependencies.
 */

var Track = require('segmentio-facade').Track;
var extend = require('extend');
var md5 = require('md5');
var moment = require('moment');

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
 * Map identify.
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

exports.identify = function(identify){
  return identify;
};

/**
 * Map group.
 *
 * @param {Group} group
 * @return {Object}
 * @api private
 */

exports.group = function(group){
  return group;
};

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track) {
  return track;
};

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


/**
 * Map alias.
 *
 * @param {Alias} alias
 * @return {Object}
 * @api private
 */

exports.alias = function(alias){
  return alias;
};
