/* 
 * HWA2 - Homework Assignment #2
 * 
 * Helpers Module: 
 */

/**** DEPENDENCIES ****/
// NodeJS
const crypto = require('crypto');
// Local
const config = require('./config');

/**** HELPERS MODULE ****/

// module container
const helpers = {};

helpers.log = {};

helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let str = '';
        for (i=0; i<strLength; i++) {
            const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            str+= randomChar;
        }
        return str;
    } else {
        return false;
    }
}

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) 
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');

    return false;
};

helpers.log.info = (level, message, object) => {
    level = typeof(level) == 'number' ? level : 0;
    message = typeof(message) == 'string' ? message : false;
    object = typeof(object) == 'object' ? object : false;
    if (level && message) {
        for (let i=1; i<level; i++) {
            console.group();
        }
        console.log('INFO: %s', message);
        if (object) {
            console.log(object);
        }        
        for (let i=1; i<level; i++) {
            console.groupEnd();
        }
    } else {
        helpers.log.error(1, 'Unexpected log.info format', {level, message, object});
    }
};

helpers.log.error = (level, message, object) => {
    level = typeof(level) == 'number' ? level : 0;
    message = typeof(message) == 'string' ? message : false;
    object = typeof(object) == 'object' ? object : false;
    if (level && message) {
        for (let i=1; i<level; i++) {
            console.group();
        }
        console.error('ERROR: %s', message);        
        if ( object ) {
            console.error(object);
        }
        for (let i=1; i<level; i++) {
            console.groupEnd();
        }
    }
};

// parse a JSON string to an object
helpers.parseJsonToObject = (jStr) => {
    try  {
        return JSON.parse(jStr);
    } catch(e) {
        return {};
    }
};


/**** MODULE EXPORTS ****/
module.exports = helpers;