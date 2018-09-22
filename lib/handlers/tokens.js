/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: Handle users endpoint server requests
 */


/**** DEPENDENCIES ****/
// NodeJS
// Local
const _data = require('./../data');
const _handlerUtil = require('./util');
const helpers = require('./../helpers');

/**** HANDLERS USERS MODULE ****/
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

handler._method.get = (data, callback) => {
  const {queryString, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // Lookup token
    _data.read('tokens', queryString.data.token, (err, tokenData) => {
      if (!err && tokenData) {
          callback(200, tokenData);
      } else {
          callback(404, {'Error': 'Could not find the specified token'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};

handler._method.post = (data, callback) => {
  const {headers, body, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // create a token
    const tokenData = body.data;
    const emailAddress = tokenData.emailAddress;

    _data.read('users', emailAddress, (err, userData) => {
      if (!err && userData) {
        // hash sent password and compare to password in user object
        const hashedPassword = helpers.hash(tokenData.password);
        if (hashedPassword == userData.hashedPassword) {
          // create token with expiration date 1 hr in future
          const id = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {emailAddress, token: id, expires};
          // store the token
          _data.create('tokens', id, tokenObject, (err) => {
            if (!err) {
              const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, tokenObject);
              callback(200, resData);
            } else {
              callback( 500, {'Error': 'Could not create new token'});
            }
          });
        } else {
          callback(400, {'Error': 'Password did not match specified user\'s password'});
        }
      } else {
        callback(400, {'Error': 'Could not find the specified user'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};

handler._method.put = (data, callback) => {
  const {headers, body, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // Lookup token
    _data.read('tokens', body.data.token, (err, tokenData) => {
      if (!err && tokenData) {
        // check token has not expired
        if (tokenData.expires > Date.now()) {
          // set expiration 1 hr from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // store the token
          _data.update('tokens', body.data.token, tokenData, (err) => {
              if (!err) {
                const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, tokenData);
                callback(200, resData);
              } else {
                  callback(500, {'Error': 'Could not update extended token'});
              }
          });
        } else {
            callback(400, {'Error': 'Token has already expired'});
        }
      } else {
          callback(404, {'Error': 'Could not find the specified token'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};


/**** MODULE EXPORTS ****/
module.exports = handler;