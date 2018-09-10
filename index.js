/* 
 * HWA2 - Homework Assignment #2
 * 
 */

/**** DEPENDENCIES ****/
// nodeJS 

// Local
config = require('./lib/config');

// container
const hwa2 = {}

// Local dependencies
hwa2.server = require('./lib/server.js');

// init servers
server.init(config.server);

// Exports
module.exports = hwa2;

