/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: handle routed server requests
 */

// @TODO - separate endpoints into different modules
// @TODO - pull acceptable methods and required header keys and querystring fields from config
// @TODO - return expectations in response when a request is invalid

/**** DEPENDENCIES ****/
// NodeJS
// Local
helpers = require('./../helpers');

/**** HANDLERS UTIL MODULE ****/
util = {};

util._validEndpointMethod = (ep, findMethod, callback) => {
    ep = typeof(ep) == 'object' ? ep : false;
    const methods = typeof(ep.methods) == 'object' ? ep.methods : false;
    
    if (ep && methods) {
        const method = ep.methods.find((method) => {
            return method.method==findMethod;
        });
        if (typeof(method) == 'object') {
            callback(false, method);
        } else {
            helpers.log.info(2, `Could not find ${findMethod} method configuration`);
            callback(true);
        }
    } else {
        helpers.log.error(1, 'Invalid endpoint configuration', ep)
        callback(true);
    }
};

/**** MODULE EXPORTS ****/
module.exports = util;