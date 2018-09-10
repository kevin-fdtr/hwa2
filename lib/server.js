/* 
 * HWA2 - Homework Assignment #2
 * 
 * Server Module: HTTP server, HTTPS Server
 */

/**** DEPENDENCIES ****/
// Node
const HTTP = require('http');
const HTTPS = require('https');
// Local
const helpers = require('./helpers');


/**** SERVER MODULE ****/
server = {} ;

server.defaultConfig = {
    http: {
        port: 3000,
        hostname: 'localhost'
    }
};


// http server
server.httpServer = HTTP.createServer((req,res) => {
    res.statusCode = 200;
    res.setHeader = ('Content-Type', 'application/JSON');
    res.end('Hello world');
});

server.httpServer.init = (options, callback) => {
    server.httpServer.listen(options, (err) => {
        if (!err) {
            helpers.log.info(1, `HTTP Server: Listening on port ${options.port}`);
        } else {
            callback(err);
        }

    });
    // handle for error events
    server.httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            helpers.log.error(1, 'Address in use', err);
        } else {
            helpers.log.error(1, 'HTTP Server error', err);
        }
    });
};

// init server
server.init = (config) => {
    const validConfig = server._validConfig(config) ? config : server.defaultConfig;
    server.httpServer.init(validConfig.http, (err) => {
        if (err) {
            helpers.log.error(1, 'Could not init HTTP server', err);
        }
    });
}

// check that the http config contains all the appropriate properties of the right type
server._validHttpConfig = (config) => {
    const validHttpConfig = typeof(config.http) == 'object' ? true : false;
    const validHttpPort = typeof(config.http.port) == 'number' ? true : false;
    const validHttpHostName = typeof(config.http.hostname) == 'string' 
            && config.http.hostName.length > 0 
            ? true : false;
    return validHttpConfig && validHttpPort && validHttpHostName;
};

// check that the server config contains all the appropriate properties of the right type
server._validConfig = (config) => {
    const validConfig = typeof(config) == 'object' ? true : false;
    const validHttpConfig = server._validHttpConfig;
    return validConfig && validHttpConfig;
};

/**** MODULE EXPORTS ****/
module.exports = server;