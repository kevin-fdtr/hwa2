/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: Handle menuitems endpoint server requests
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
  const {headers, queryString, error, errors} = _handlerUtil.parseRequestWithConfig(data, handler.config);

  if (!error) {
    // verify the given token is valid for the email address
    _handlerUtil.verifyToken(headers.data.token, queryString.data.emailAddress, (tokenIsValid) => {
      if (tokenIsValid) {
        // array for menu item objects
        const items = [];
        // get list of all menu items in menuitems folder
        _data.list('menuitems', (err, menuItems) => {
            if (!err) {
                // load each menuitem file's data and add to items array
                const itemsCount = menuItems.length;
                let processCount = 0;

                for (const item in menuItems) {
                    const itemValue = menuItems[item];
                    _data.read('menuitems', itemValue, (err, menuData) => {
                        if (!err) {
                            items.push(menuData);
                        } else {
                            helpers.log.error(1, `Could not read menuitem file ${itemValue}.json.`);
                        }
                        // check if we are done processing all files
                        processCount++;
                        if (processCount >= itemsCount) {
                            const menu = { items };
                            const resData = _handlerUtil.parseResponseBodyDataWithConfig(handler.config, data.method, menu);
                            callback(false, resData);
                        }
                    });
                }
            } else {
                helpers.log.error(1, "could not get list of menu items");
                callback(true);
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