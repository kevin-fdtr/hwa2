/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: Handle carts endpoint server requests
 */


/**** DEPENDENCIES ****/
// NodeJS
// Local
const _data = require('./../data');
const _handlerUtil = require('./util');


/**** HANDLERS CARTS MODULE ****/
const handler = {};

// config should be set by parent while loading REST configuration data
handler.config = {};

handler.endpoint = (data, callback) => {
  // check that this handler is configured to handle the method property set in data
  // config may be disabled in config even if available in code
  const epMethodConfig = _handlerUtil.getEndpointMethodConfig(handler.config, data.method);
  if (epMethodConfig) {
    const method = typeof(handler._method[data.method]) == 'function' ? handler._method[data.method] : false;
    if (method) {
        method(data, callback);    
    } else {
        callback(500, {"Error": `${data.method} ${handler.config.url} is not implemented.`});
    }
  } else {
    callback(405, {"message": "GET /api endpoint to see available endpoints methods and requirements for usage"});
  }
};

handler._method = {};

handler._method.delete = (data, callback) => {
  const {headers, queryString, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // verify the given token is valid for the email address
    _handlerUtil.verifyToken(headers.data.token, queryString.data.emailAddress, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup user
        _data.read('users', queryString.data.emailAddress, (err, userData) => {
          if (!err && userData) {
            callback(200);
          } else {
            callback(400, {'Error': 'Could not find the specified user'});
          }
        });
      } else {
        callback(403, {'Error': 'Token is not valid'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};

handler._method.get = (data, callback) => {
  const {headers, queryString, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // verify the given token is valid for the email address
    _handlerUtil.verifyToken(headers.data.token, queryString.data.emailAddress, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup user
        _data.read('users', queryString.data.emailAddress, (err, userData) => {
          if (!err && userData) {
            callback(200);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {'Error': 'Token is not valid'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};

handler._method.post = (data, callback) => {
  const {headers, queryString, body, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // verify the given token is valid for the email address
    _handlerUtil.verifyToken(headers.data.token, queryString.data.emailAddress, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup user
        _data.read('users', queryString.data.emailAddress, (err, userData) => {
          if (!err && userData) {
            // load items from user's cart or create a cart
            _data.read('carts', queryString.data.emailAddress, (err, cartData) => {
              if (!err) {
                _data.update('carts', queryString.data.emailAddress, body.data, (err) => {
                  if (err) {
                    return callback(500, {'Error': 'Could not update user\'s cart'});
                  }
                });
              } else {
                _data.create('carts', queryString.data.emailAddress, body.data, (err) => {
                  if (err) {
                    return callback(500, {'Error': 'Could not create user\'s cart'});
                  }
                })
              }
            });
            // only send back configured object data
            const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, body.data);
            callback(200, resData);
          } else {
            callback(404, {'Error': 'Could not find specified user'});
          }
        });
      } else {
        callback(403, {'Error': 'Token is not valid'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};


/**** MODULE EXPORTS ****/
module.exports = handler;