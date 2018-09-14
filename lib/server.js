/* 
 * HWA2 - Homework Assignment #2
 * 
 * Server Module: HTTP server, HTTPS Server
 */

/**** DEPENDENCIES ****/
// Node
const FS = require('fs');
const HTTP = require('http');
const HTTPS = require('https');
const Path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const URL = require('url');

// Local
const handlers = require('./handlers');
const helpers = require('./helpers');

/**** SERVER MODULE ****/
server = {} ;

server.defaultConfig = {
    http: {
        port: 0,
        hostname: 'localhost'
    },
    https: {
        port: 0,
        hostname: 'localhost'
    }
};

// http server
server.httpServer = HTTP.createServer((req,res) => {
    server.commonServer(req, res);
});

// init http server
server.httpServer.init = (options, callback) => {
    server.httpServer.listen(options, (err) => {
        if (!err) {
            helpers.log.info(1, `HTTP Server listening at http://${options.hostname}:${server.httpServer.address().port}`);
        } else {
            callback(err);
        }

    });
    // handler for error events
    server.httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            helpers.log.error(1, 'Address in use', err);
        } else {
            helpers.log.error(1, 'HTTP Server error', err);
        }
    });
};

// https server
server.httpsServerOptions = {
    'key' : FS.readFileSync(Path.join(__dirname, '/../https/key.pem')),
    'cert' : FS.readFileSync(Path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = HTTPS.createServer(server.httpsServerOptions, (req,res) => {
    server.commonServer(req, res);    
});

// init https server
server.httpsServer.init = (options, callback) => {
    server.httpsServer.listen(options, (err) => {
        if (!err) {
            helpers.log.info(1, `HTTPS Server listening at https://${options.hostname}:${server.httpsServer.address().port}`);
        } else {
            callback(err);
        }

    });
    // handler for error events
    server.httpsServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            helpers.log.error(1, 'Address in use', err);
        } else {
            helpers.log.error(1, 'HTTPS Server error', err);
        }
    });
};

// init server
server.init = (config) => {
    let validConfig = false;
    if (server._validConfig(config)) {
        validConfig = config;
    } else {
        helpers.log.error(1, 'Invalid server configuration. Trying defaults...', server.defaultConfig);
        if (server._validConfig(server.defaultConfig)) {
            validConfig = server.defaultConfig;
        }            
    }
    
    if (validConfig) {
        server.httpServer.init(validConfig.http, (err) => {
            if (err) {
                helpers.log.error(1, 'Could not init HTTP server', err);
            }
        });
        server.httpsServer.init(validConfig.https, (err) => {
            if (err) {
                helpers.log.error(1, 'Could not init HTTPS server', err);
            }
        });
    } else {
        helpers.log.error(1, 'Invalid server configuration object', err);
    }
}

// check that the http config contains all the appropriate properties of the right type
server._validHttpConfig = (config) => {
    const validHttpConfig = typeof(config) == 'object' ? true : false;
    const validHttpPort = typeof(config.port) == 'number' ? true : false;
    const validHttpHostName = typeof(config.hostname) == 'string' 
            && config.hostname.length > 0 
            ? true : false;
    return validHttpConfig && validHttpPort && validHttpHostName;
};

// check that the server config contains all the appropriate properties of the right type
server._validConfig = (config) => {
    const validConfig = typeof(config) == 'object' ? true : false;
    if (validConfig) {
        const validHttpConfig = typeof(config.http) == 'object' && server._validHttpConfig(config.http);
        const validHttpsConfig = typeof(config.https) == 'object' && server._validHttpConfig(config.https);
        return validHttpConfig && validHttpsConfig;
    } else {
        return false;
    }
};

server.commonServer = (req, res) => {
   // pull necessary data from request
   const url = URL.parse(req.url, true);
   const path = url.pathname;
   const trimmedPath = path.replace(/^\/+|\/+$/g,'');
   const queryStringObject = url.query;
   const method = req.method.toLowerCase();
   const headers = req.headers;

   const decoder = new StringDecoder('utf-8');
   let buffer = '';

   // write incomming data chunks to buffer
   req.on('data', (data) => {
       buffer += decoder.write(data);
   });
   req.on('end', () => {
        buffer+= decoder.end();
        const payload = helpers.parseJsonToObject(buffer);

        // assign handler for this request
        handlers.getHandler(trimmedPath, method, (err, handler) => {
            // we will have a handler regardless or err
            
            // Construct data object to sent to the handler
            const data = {
                trimmedPath,
                queryStringObject,
                method,
                headers,
                payload 
            };
         
            // Route the request to the handler
            handler(data, (statusCode, payload) => {
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
                payload = typeof(payload) == 'object' ? payload : {};
        
                const payloadString = JSON.stringify(payload);
        
                // Return the response
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(statusCode);
                res.end(payloadString);
        
                if (statusCode==200) {
                    helpers.log.info(2, method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
                } else {
                    helpers.log.info(2, method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
                }
            });
        });
   });
};


/**** MODULE EXPORTS ****/
module.exports = server;