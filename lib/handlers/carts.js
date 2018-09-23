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
            _data.delete('users', queryString.data.emailAddress, (err) => {
              if (!err) {
                // only send back configured object data
                const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, userData);
                callback(200, resData);
              } else {
                  callback(500, {'Error': 'Could not delete the specified user'});
              }
            });
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
            // only send back configured object data
            const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, userData);
            callback(200, resData);
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
  const {body, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    _data.read('users', body.data.emailAddress, (err, userData) => {
      if (err) {
        // hash the password
        const hashedPassword = helpers.hash(body.data.password);
        if (hashedPassword) {
          // store hashed password, not original password
          body.data.hashedPassword = hashedPassword;
          delete body.data.password;
          // create the user
          _data.create('users', body.data.emailAddress, body.data, (err) => {
              if (!err) {
                // only send back configured object data
                const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, body.data);
                callback(200, resData);
              } else {
                callback(500, {"Error": "User could not be created."});
              }
          });
        } else {
          callback(500, {'Error':'Could not hash the user\'s password'});
        }
      } else {
        callback(400, {'Error' : 'A user with that email already exists'});
      }
    });
  } else {
    callback(500, {"Errors": errors});
  }
};

handler._method.put = (data, callback) => {
  const {headers, body, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // all upate fields should be optional so let's make sure we have some
    if (body.config.optional && body.optionalCount > 0 || !body.config.optional) {
      // merge required and optional body data
      const headerData = headers.data;

      // Get token from headers
      const token = headerData.token;

      // verify the given token is valid for the email address
      _handlerUtil.verifyToken(token, body.data.emailAddress, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('users', body.data.emailAddress, (err, userData) => {
            if (!err && userData) {
              // merge userData with the body.data. properties in body.data will override properties in userData
              const newUserData = {...userData, ...body.data};
              // if there is a password, hash it and store hash, not original password
              if (typeof(newUserData.password == 'string')) {
                // hash the password
                const hashedPassword = helpers.hash(newUserData.password);
                if (hashedPassword) {
                  newUserData.hashedPassword = hashedPassword
                }
                delete newUserData.password;
              }

              // store the user
              _data.update('users', newUserData.emailAddress, newUserData, (err) => {
                if (!err) {
                  // only send back configured object data
                  const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, newUserData);
                  callback(200, resData);
                } else {
                  callback(500, {'Error' : 'The user could not be updated'});
                }
              });
            } else {
              callback(400, {'Error': 'The specified user does not exist'});
            }
          }); 
        } else {
          callback(403, {'Error': 'Token is not valid'})
        }
      });
    } else {
      callback(400, {'Error': 'Nothing to update'});
    }
  } else {
    callback(500, {"Errors": errors});
  }
};


/**** MODULE EXPORTS ****/
module.exports = handler;