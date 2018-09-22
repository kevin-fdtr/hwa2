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

// extract properties from dataObj configured in configArray
// return empty object if no preties extracted
util.getBodyData = (configArray, dataObj) => {
  const bodyData = {};
  for (const pos in configArray) {
    const prop = configArray[pos];
    // only store value if of the configured type
    const data = typeof(dataObj[prop.name]) == prop.type ? dataObj[prop.name] : false;
    if (data) {
      bodyData[prop.name] = dataObj[prop.name];
    }
  }
  return bodyData;
}

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

util.parseObjectDataWithConfig = (config, configKey, method, dataObj) => {
  // take care with "required" vs. "request" in header variable names below
  const epMethodConfig = util.getEndpointMethodConfig(config, method);

  // determine what body data to extract from payload
  const requiredDataConfig = epMethodConfig[configKey] instanceof Array 
        && epMethodConfig[configKey].length > 0 
        ? epMethodConfig[configKey] : false;

  let requiredData = false;

  if (requiredDataConfig) {
    // pull required properties from data object
    const properties = util.getObjDataWithArrayConfig(requiredDataConfig, dataObj);
    // only set requiredData if we found required headers and have the expected # of headers
    let propCount = 0;
    for (const property in properties) {
      propCount++;
    }
    if (propCount > 0 && propCount == requiredDataConfig.length) {
      requiredData = properties;
    }
  } 
  return {requiredDataConfig, requiredData};
};

// extract properties from dataObj configured in configArray
// return empty object if no preties extracted
util.getObjDataWithArrayConfig = (configArray, dataObj) => {
  const dataAsObj = {};
  for (const pos in configArray) {
    const key = configArray[pos];
    // only store value if of the configured type
    const data = typeof(dataObj[key]) == 'string' ? dataObj[key] : false;
    if (data) {
      dataAsObj[key] = dataObj[key];
    }
  }
  return dataAsObj;
};

// builds data objects from requestBody based on the handlers configuration and the request method
util.parseRequestBodyDataWithConfig = (config, method, requestBody) => {
  // take care with "required" vs. "request" in bodyData variable names below  
  const epMethodConfig = util.getEndpointMethodConfig(config, method);

  // determine what body data to extract from requestBody
  const requiredBodyDataConfig = epMethodConfig.requiredBodyData instanceof Array ? epMethodConfig.requiredBodyData : false;
  const optBodyDataConfig = epMethodConfig.optionalBodyData instanceof Array ? epMethodConfig.optionalBodyData : false;
  
  // get required data separately from optional data so we can tell if 
  // the request properly filled in the required data
  
  let requiredBodyData = false, 
      optBodyData = false;
  
  if (requiredBodyDataConfig) {
    // pull required body data from requestBody 
    const properties = util.getBodyData(requiredBodyDataConfig, requestBody);
    // only set requiredBodyData if we found required properties and have the expected # of properties
    let propCount = 0;
    for (const props in properties) {
      propCount++;
    }
    if (propCount > 0 && propCount == requiredBodyDataConfig.length) {
      requiredBodyData = properties;
    }
  } 
  
  if (optBodyDataConfig) {
    // pull optional body data from requestBody 
    const properties = util.getBodyData(optBodyDataConfig, requestBody);
    // only set optBodyData if we found optional properties
    let propCount = 0;
    for (const props in properties) {
      propCount++;
    }
    if (propCount > 0) {
      optBodyData = properties;
    }
  }

  return {requiredBodyDataConfig, requiredBodyData, optBodyDataConfig, optBodyData};
};

// use config data to setup data in a consistent way
util.parseRequestWithConfig = (data, config) => {
  // parse query string data using our method configuration
  const queryStringData = util.parseObjectDataWithConfig(config, 'requiredQueryParameters', data.method, data.queryStringObject);
  // parse header data using our method configuration
  const headersData = util.parseObjectDataWithConfig(config, 'requiredHeaderParameters', data.method, data.headers);
  // parse request body data using our method configuration
  const bodyData = util.parseRequestBodyDataWithConfig(config, data.method, data.payload);

  let error = false;
  const errors = [];

  if (queryStringData.requiredDataConfig.length > 0 && !queryStringData.requiredData) {
    error = true;
    errors.push(`${data.method.toUpperCase()} ${config.url}: Missing required query string parameter.`);
  }
  if (headersData.requiredDataConfig.length > 0 && !headersData.requiredData) {
    error = true;
    errors.push(`${data.method.toUpperCase()} ${config.url}: Missing required header property.`);
  }
  if (bodyData.requiredBodyDataConfig.length > 0 && !bodyData.requiredBodyData) {
    error = true;
    errors.push(`${data.method.toUpperCase()} ${config.url}: Missing required body property.`);
  }

  const dataObj = {
    headers: {
      config: {
        required: headersData.requiredDataConfig, 
      },
      data: headersData.requiredData,
      requiredCount: Object.keys(headersData.requiredData).length,
    },
    queryString: {
      config: {
        required: queryStringData.requiredDataConfig
      },
      data: queryStringData.requiredData,
      requiredCount: Object.keys(queryStringData.requiredData).length,
    },
    body: {
      config: {
        required: bodyData.requiredBodyDataConfig,
        optional: bodyData.optBodyDataConfig
      },
      data: {...bodyData.requiredBodyData, ...bodyData.optBodyData},
      requiredCount: Object.keys(bodyData.requiredBodyData).length,
      optionalCount: Object.keys(bodyData.optBodyData).length,
    },
    error
  };

  if (error) {
    dataObj.errors = errors;
  }

  return dataObj;
};

// builds repsonse data payload based on the handlers configuration and the request method
util.parseResponseBodyDataWithConfig = (config, method, objData) => {
  const epMethodConfig = util.getEndpointMethodConfig(config, method);
  // determine what body data to extract from payload
  const resBodyDataConfig = epMethodConfig.responseBody instanceof Array ? epMethodConfig.responseBody : false;
  // pull required body data from payload 
  return util.getBodyData(resBodyDataConfig, objData);
};

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


/**** MODULE EXPORTS ****/
module.exports = util;