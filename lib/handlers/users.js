/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: Handle users endpoint server requests
 */


/**** DEPENDENCIES ****/
// NodeJS
// Local
const handlerUtil = require('./util');


/**** HANDLERS USERS MODULE ****/
const handler = {};

// config should be set by parent while loading REST configuration data
handler.config = {};

handler.endpoint = (data, callback) => {
    // check that this handler is configured to handle the method property set in data
    handlerUtil._validEndpointMethod(handler.config, data.method, (err, valid) => {
        if (!err && valid) {
            // check that we actually have a function for the desired method
            const method = typeof(handler._method[data.method]) == 'function' ? handler._method[data.method] : false;
            if (method) {
                method(data, callback);    
            } else {
                callback(405, {"message": "GET /api endpoint to see available endpoints methods and requirements for usage"});
            }
        } else {
            callback(405, {"message": "GET /api endpoint to see available endpoints methods and requirements for usage"});
        }
    });
};

handler._method = {};

handler._method.get = (data, callback) => {
    callback(200, handler.config);
};


/**** MODULE EXPORTS ****/
module.exports = handler;