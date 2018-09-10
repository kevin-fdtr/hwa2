/* 
 * HWA2 - Homework Assignment #2
 * 
 * XXX Module: 
 */

/**** DEPENDENCIES ****/
// NodeJS
// Local


/**** XXX MODULE ****/

// module container
const helpers = {};

helpers.log = {};

helpers.log.info = (level, message, object) => {
    level = typeof(level) == 'number' ? level : 0;
    message = typeof(message) == 'string' ? message : false;
    object = typeof(info) == 'object' ? object : false;
    if (level && message) {
        console.log('INFO L%d: %s', level, message);
        if (object) {
            console.log(object);
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
        console.error('ERROR L%d: %s', level, message);        
        if ( object ) {
            console.error(object);
        }
    }
};


/**** MODULE EXPORTS ****/
module.exports = helpers;