/* 
 * HWA2 - Homework Assignment #2
 * 
 */

/**** DEPENDENCIES ****/
// nodeJS 

// Local
const config = require('./lib/config');
const helpers = require('./lib/helpers');
const server = require('./lib/server.js');

// container
const hwa2 = {}

hwa2.server = server;

// init servers
server.init(config.server);

// Exports
module.exports = hwa2;

