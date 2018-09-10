/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: handle routed server requests
 */

/**** DEPENDENCIES ****/
// NodeJS
// Local
const helpers = require('./helpers');
const config = require('./config');


/**** HANDLERS MODULE ****/
const handlers = {};

handlers.api = (data, callback) => {
    const accepptableMethods = ['get'];

    if (accepptableMethods.indexOf(data.method) > -1) {
        handlers._api[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._api = {};

handlers._api.get = (data, callback) => {
    callback(200, config.endpoints);
};

handlers.notFound = (data, callback) => {
    callback(404);
};

/**** MODULE EXPORTS ****/
module.exports = handlers;