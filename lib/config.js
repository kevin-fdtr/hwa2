/* 
 * HWA2 - Homework Assignment #2
 * 
 * Configuration: HTTP, HTTPS
*/

/**** DEPENDENCIES ****/
// nodeJS 

// Local

/**** CONFIG MODULE ****/
environments = {};

environments.staging = {
    envName: 'staging',
    server: {
        http: {
            port: 3000,
            hostname: 'localhost'
        },
        https: {
            port: 3001,
            hostname: 'localhost'
        }
    },
    hashingSecret: '7kP3TAQTxz3gaR76nzn9'
};

environments.production = {
    envName: 'production',
    server: {
        http: {
            port: 5000,
            hostname: 'localhost'
        },
        https: {
            port: 5001,
            hostname: 'localhost'
        }
    },
    hashingSecret: 'O9nmIQFdzWHhGKrGyeWF'
};

// environment specified on command line?
const environment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// default to staging if environment is not defined above
const environmentToExport = typeof(environments[environment]) == 'object' ? environments[environment] : environments.staging;

/**** MODULE EXPORTS ****/
module.exports = environmentToExport;
