/* 
 * HWA2 - Homework Assignment #2
 * 
 * Helpers Module: 
 */

/**** DEPENDENCIES ****/
// NodeJS
// Local


/**** HELPERS MODULE ****/

// module container
const helpers = {};

helpers.log = {};
helpers.log.colors = [,'\x1b[32m%s\x1b[0m']

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


/**** MODULE EXPORTS ****/
module.exports = helpers;