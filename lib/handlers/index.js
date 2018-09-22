/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: handle routed server requests
 */

// @TODO - return expectations in response when a request is invalid

/**** DEPENDENCIES ****/
// NodeJS
// Local

const _data = require('../data');
const helpers = require('../helpers');

/**** HANDLERS MODULE ****/
const handlers = {};
handlers.api = require('./api');
handlers.users = require('./users');
handlers.tokens = require('./tokens');
handlers.menuitems = require('./menuitems');

handlers.endpoints = {};

handlers.endpoints.config = false;

handlers.getHandler = (ep, reqMethod, callback) => {
    handlers._getEndpointConfig((err, config) => {
        if (!err) {
            const endpoint = typeof(config[ep]) == 'object' ? config[ep] : false;
            const handler = endpoint && typeof(handlers[ep].endpoint) == 'function' ? handlers[ep].endpoint : false;
            if (endpoint && handler) {
                callback(false, handler);
            } else {
                callback(true, handlers.notFound);
            }
        } else {
            callback(true, handlers.notFound)
        }
    });
};

// @TODO - Add validation of JSON loaded from api folders
handlers._getEndpointConfig = (callback) => {
    if (!handlers.endpoints.config) {
        // container for configuration 
        let endpointConfig = {};
        // get list of all endpoint files in api folder
        _data.list('api', (err, endpoints) => {
            if (!err) {
                // load each endpoint file's data into configuration container
                const endpointCount = endpoints.length;
                let processCount = 0;

                for (const item in endpoints) {
                    const itemValue = endpoints[item];
                    _data.read('api', itemValue, (err, apiData) => {
                        if (!err) {
                            // add validation of JSON config here
                            // do we have a handler for this end point?
                            if (typeof(handlers[itemValue])== 'object') {
                                endpointConfig[itemValue] = apiData;
                                handlers[itemValue].config = apiData;
                            } else {
                                helpers.log.error(1, `No handler for api configuration "${itemValue}"`);    
                            }
                        } else {
                            helpers.log.error(1, `Could not read api configuration file ${itemValue}.json.`);
                        }
                        // check if we are done processing all files
                        processCount++;
                        if (processCount >= endpointCount) {
                            handlers.endpoints.config = endpointConfig;
                            // specially add full config to the api endpoint
                            handlers.api.fullConfig = endpointConfig;
                            callback(false, endpointConfig);
                        }
                    });
                }
            } else {
                helpers.log.error(1, "could not get list of API endpoints");
                callback(true);
            }
        });
    } else {
        callback(false, handlers.endpoints.config)
    }
}

// NOT FOUND
handlers.notFound = (data, callback) => {
    callback(404, {"message": "GET /api endpoint to see available endpoints and methods"});
};

/**** MODULE EXPORTS ****/
module.exports = handlers;