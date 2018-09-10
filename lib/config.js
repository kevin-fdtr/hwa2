/* 
 * HWA2 - Homework Assignment #2
 * 
 * Configuration: HTTP, HTTPS
*/

/**** DEPENDENCIES ****/
// nodeJS 

// Local

/**** CONFIG MODULE ****/
config = {};

config.server = {
    http: {
        port: 3000,
        hostname: 'localhost'
    }
};

/**** MODULE EXPORTS ****/
module.exports = config;