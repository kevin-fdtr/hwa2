/* 
 * HWA2 - Homework Assignment #2
 * 
 * HANDLERS Module: utility functions to handle routed server requests
 */

// @TODO - return expectations in response when a request is invalid

/**** DEPENDENCIES ****/
// NodeJS
// Local
_data = require('./../data');
helpers = require('./../helpers');

/**** HANDLERS UTIL MODULE ****/
util = {};


// Misc Helpers

// verify if a given token id is currently valid for a given user
util.verifyToken = (id, emailAddress, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.emailAddress == emailAddress && tokenData.expires > Date.now()) {
        return callback(true);
      }
    }
    return callback(false);
  });
};

// Request Helpers

// Checks that configured minimums are met in data
// this function assumes that objects defined in config are present in data
// @TODO: This algorithm may be more efficient if the main loop traversed data rather than config
util.checkDataMinLength = (config, data) => {
  let error = false;
  if (config) {
    if (typeof(config) == 'object' && config instanceof Array) {
      for (const obj in config) {
        prop = config[obj];
        // do we have a min length configured?
        minLength = typeof(prop.minLength) == 'number' ? prop.minLength : false;
        if (minLength) {
          const propName = prop.name;
          // only check length if the property is in data and of the expected type
          if (typeof(data[propName]) == prop.type) {
            if (data[propName].length < minLength) {
                error = true;
            }  
          }
        }
      }
    } else if (typeof(config) == 'object') {
      const keys = Object.keys(config);
      for (const key in keys) {
        const prop = keys[key];
        error = util.checkDataMinLength(config[key], data[prop]);
      }
    } else {
      error = true;
    }
  }
  return error;
};

// Checks that configured properties are present in data
util.checkDataMissing = (config, data) => {
  let missing = false;
  if (config) {
    if (typeof(config) == 'object' && config instanceof Array) {
      for (const obj in config) {
        propName = config[obj].name
        if (typeof(data[propName]) == 'undefined') {
          missing = true;
        }
      }
    } else if (typeof(config) == 'object') {
      const keys = Object.keys(config);
      for (const key in keys) {
        const prop = keys[key];
        if (typeof(data[prop]) == 'undefined') {
          missing = true;
        } else {
          missing = util.checkDataMissing(config[key], data[prop]);
        }
      }
    } else {
      missing = true;
    }
  }
  return missing;
};

// extract properties from dataObj as configured in config
// return empty object(s) if no properties extracted
util.getConfiguredData = (config, dataObj) => {
  // when config is set to an array, we are returning a single object 
  // with a number of properties (as defined in the array)
  // {
  //   "key1": "value",
  //   "key2": value
  // }
  // if no keys were extracted, return an empty object
  //
  // when config is set to an object we will will be returning an object 
  // with one or more properties set to an array of objects with a number of properties
  // {
  //   "key": [
  //     {
  //       "key1": "value",
  //       "key2": value
  //     },
  //     {
  //       "key1": "value",
  //       "key2": value
  //     },
  //   ]
  // }
  // will return an empty object if no configured keys could be extracted

  const bodyData = {};

  const configIsArray = typeof(config) == 'object' && config instanceof Array ? true : false;
  const configIsObject =  typeof(config) == 'object' ? true : false;
  
  // or an obect with properties that are set to array describing object properties
  if (configIsArray) {
    if (config.length > 0) {
      for (const pos in config) {
        const prop = config[pos];
        const data = typeof(dataObj[prop.name]) == prop.type ? dataObj[prop.name] : false;
        if (data || typeof(data) == 'string') {
          bodyData[prop.name] = data;
        }
      }
    }
  } else {
    if (configIsObject) {
      // loop through configured properties
      const keys = Object.keys(config);
      for (const key in keys) {
        const prop = keys[key];
        // config for this property
        const configAtProp = typeof(config[prop]) == 'object' ? config[prop] : false;
        // data array for this property
        const dataAtProp = typeof(dataObj[prop]) == 'object' && dataObj[prop] instanceof Array ? dataObj[prop] : false;
        const objArray = [];
        if (configAtProp && dataAtProp) {
          // loop through the data array of objects and return only the configred properies of each 
          for (const data in dataAtProp) {
            if (typeof(dataAtProp[data]) == 'object') {
              objArray.push(util.getConfiguredData(configAtProp, dataAtProp[data]));  
            }
          }
        }
        bodyData[prop] = objArray;
      }
    }
  }

  return bodyData;
}

// builds data objects from requestBody based on the handlers configuration and the request method
util.parseRequestBodyDataWithConfig = (config, method, requestBody) => {
  // take care with "required" vs. "request" in bodyData variable names below  

  // get the config for this method
  const epMethodConfig = util.getEndpointMethodConfig(config, method);

  // only set config for required and optional body data if config is present, set to an object,
  // and if set to an array, the array is not empty
  let requiredBodyDataConfig = typeof(epMethodConfig.requiredBodyData) == 'object' ? epMethodConfig.requiredBodyData : false;
  if (requiredBodyDataConfig && requiredBodyDataConfig instanceof Array) {
    requiredBodyDataConfig = requiredBodyDataConfig.length > 0 ? requiredBodyDataConfig : false;
  }
  let optBodyDataConfig = typeof(epMethodConfig.optionalBodyData) == 'object' ? epMethodConfig.optionalBodyData : false;
  if (optBodyDataConfig && optBodyDataConfig instanceof Array) {
    optBodyDataConfig = optBodyDataConfig.length > 0 ? optBodyDataConfig : false;
  }

  // get required data separately from optional data so we can tell if 
  // the request properly filled in the required data
  
  let requiredBodyData = false, 
      optBodyData = false;

  if (requiredBodyDataConfig) {
    requiredBodyData = util.getConfiguredData(requiredBodyDataConfig, requestBody);
  }
  if (optBodyDataConfig) {
    optBodyData = util.getConfiguredData(optBodyDataConfig, requestBody);
  }
  
  return {requiredBodyDataConfig, requiredBodyData, optBodyDataConfig, optBodyData};
};

// builds data objects from request headers based on the handlers configuration and the request method
util.parseRequestHeadersWithConfig = (config, method, requestHeaders) => {
    // get the config for this method
  const epMethodConfig = util.getEndpointMethodConfig(config, method);

  // only set config if config is present, set to an object,
  // and if set to an array, the array is not empty
  let requiredDataConfig = typeof(epMethodConfig.requiredHeaderParameters) == 'object' 
      ? epMethodConfig.requiredHeaderParameters : false;
  if (requiredDataConfig && requiredDataConfig instanceof Array) {
    requiredDataConfig = requiredDataConfig.length > 0 ? requiredDataConfig : false;
  }
  
  let requiredData = false;

  if (requiredDataConfig) {
    requiredData = util.getConfiguredData(requiredDataConfig, requestHeaders);
  }

  return {requiredDataConfig, requiredData};
};

// builds data objects from request query string based on the handlers configuration and the request method
util.parseRequestQueryStringWithConfig = (config, method, requestQueryString) => {
  // get the config for this method
  const epMethodConfig = util.getEndpointMethodConfig(config, method);

  // only set config if config is present, set to an object,
  // and if set to an array, the array is not empty
  let requiredDataConfig = typeof(epMethodConfig.requiredQueryParameters) == 'object' 
      ? epMethodConfig.requiredQueryParameters : false;
  if (requiredDataConfig && requiredDataConfig instanceof Array) {
    requiredDataConfig = requiredDataConfig.length > 0 ? requiredDataConfig : false;
  }

  let requiredData = false;

  if (requiredDataConfig) {
    requiredData = util.getConfiguredData(requiredDataConfig, requestQueryString);
  }

  return {requiredDataConfig, requiredData};
};

// use config data to setup data in a consistent way
util.parseRequestWithConfig = (data, config) => {
  // parse query string data using our method configuration
  const queryStringData = util.parseRequestQueryStringWithConfig(config, data.method, data.queryStringObject );
  // parse header data using our method configuration
  const headersData = util.parseRequestHeadersWithConfig(config, data.method, data.headers );
  // parse request body data using our method configuration
  const bodyData = util.parseRequestBodyDataWithConfig(config, data.method, data.payload);
  let errorObj = {
    error: false,
    errors: []
  }

  // we are going to do this a few times
  const checkMissing = (method, config, data, desc, errObj) => {
    if (config) {
      if (util.checkDataMissing(config, data)) {
        errObj.error = true;
        errObj.errors.push(`${method.toUpperCase()} ${config.url}: Missing required ${desc} parameter(s).`);
      }
    }
  };
  // are we missing required query string data? 
  checkMissing(data.method, queryStringData.requiredDataConfig, queryStringData.requiredData, 'query string', errorObj);
  // are we missing required header data? 
  checkMissing(data.method, headersData.requiredDataConfig, headersData.requiredData, 'header parameter', errorObj);
  // are we missing required body data? 
  checkMissing(data.method, bodyData.requiredBodyDataConfig, bodyData.requiredBodyData, 'body', errorObj);

  // if no errors yet, check min lengths
  if (!errorObj.error) {
    // we are going to do this a few times
    const checkMin = (method, requiredDataConfig, requiredData, desc, errObj) => {
      if (util.checkDataMinLength(requiredDataConfig, requiredData)) {
        errObj.error = true;
        errObj.errors.push(`${method.toUpperCase()} ${config.url}: Some required ${desc} data does not meet min length.`);
      }
    };
    //do any of our query string parameters not meet our min requirements?
    checkMin(data.method, queryStringData.requiredDataConfig, queryStringData.requiredData, 'query string', errorObj);
    //do any of our header parameters not meet our min requirements?
    checkMin(data.method, headersData.requiredDataConfig, headersData.requiredData, 'header parameter', errorObj);
    // do any of our required body fields not meet our min requirements?
    checkMin(data.method, bodyData.requiredBodyDataConfig, bodyData.requiredBodyData, 'required body', errorObj);
    // do any of our optional body fields not meet our min requirements?
    checkMin(data.method, bodyData.optBodyDataConfig, bodyData.optBodyData, 'optional body', errorObj);
  }

  // build the return data object
  const dataObj = {
    headers: {
      config: {
        required: headersData.requiredDataConfig, 
      },
      data: headersData.requiredData
    },
    queryString: {
      config: {
        required: queryStringData.requiredDataConfig
      },
      data: queryStringData.requiredData
    },
    body: {
      config: {
        required: bodyData.requiredBodyDataConfig,
        optional: bodyData.optBodyDataConfig
      },
      data: {...bodyData.requiredBodyData, ...bodyData.optBodyData}
    },
    error: errorObj.error
  };

  if (bodyData.requiredBodyDataConfig) {
    dataObj.body.requiredCount = Object.keys(bodyData.requiredBodyData).length;
  }
  if (bodyData.optBodyDataConfig) {
    dataObj.body.optionalCount = Object.keys(bodyData.optBodyData).length;
  }
  
  if (errorObj.error) {
    dataObj.errors = errorObj.errors;
  }

  return dataObj;
};


// Response Helpers

// builds repsonse data payload based on the handlers configuration and the request method
util.parseResponseBodyDataWithConfig = (config, method, objData) => {
  const epMethodConfig = util.getEndpointMethodConfig(config, method);
  // determine what body data to extract from payload
  const resBodyDataConfig = typeof(epMethodConfig.responseBody) == 'object' ? epMethodConfig.responseBody : false;
  // pull required body data from payload 
  return util.getConfiguredData(resBodyDataConfig, objData);
};


// Config helpers

util.getEndpointMethodConfig = (ep, findMethod) => {
  ep = typeof(ep) == 'object' ? ep : false;
  const methods = typeof(ep.methods) == 'object' ? ep.methods : false;
  
  if (ep && methods) {
    const method = ep.methods.find((method) => {
      return method.method==findMethod;
    });
    if (typeof(method) == 'object') {
      return method;
    } else {
      helpers.log.info(2, `Could not find ${findMethod} method configuration`);
      return false;
    }
  } else {
    helpers.log.error(1, 'Invalid endpoint configuration', ep)
    return false;
  }
};


/**** MODULE EXPORTS ****/
module.exports = util;