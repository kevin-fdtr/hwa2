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
    }
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
    }
};

endpoints = [
    {
        "url": "/api",
        "methods": [
            {
                "method": "get",
                "name": "api endpoint list",
                "header key parameters": [],
                "query parameters": []
            }
        ]
    },
    {
        "url": "/users",
        "methods": [
            {
                "method": "get",
                "name": "get a user\'s properties",
                "header key parameters": ["token"],
                "query parameters": ["id"]
            },
            {
                "method": "post",
                "name": "add a user",
                "header key parameters": [],
                "query parameters": ["id"],
                "required body data": [
                    {
                        "name": "name",
                        "type": "string",
                    },
                    {
                        "name": "emailAddress",
                        "type": "string",
                    },
                    {
                        "name": "streetAddress",
                        "type": "string",
                    }
                ],
                "optional body data": [{}],
                "response body": [
                    {
                        "name": "id",
                        "type": "string",
                    },                    {
                        "name": "name",
                        "type": "string",
                    },
                    {
                        "name": "emailAddress",
                        "type": "string",
                    },
                    {
                        "name": "streetAddress",
                        "type": "string",
                    }
                ]
            },
            {
                "method": "put",
                "name": "update a user",
                "header key parameters": ["token"],
                "query parameters": [],
                "required body data": [
                    {
                        "name": "id",
                        "type": "string",
                    },
                ],
                "optional body data": [
                    {
                        "name": "name",
                        "type": "string",
                    },
                    {
                        "name": "emailAddress",
                        "type": "string",
                    },
                    {
                        "name": "streetAddress",
                        "type": "string",
                    }
                ]
            },
            {
                "method": "delete",
                "name": "delete a user",
                "header key parameters": ["token"],
                "query parameters": ["id"]
            },
        ]
    },
];

// environment specified on command line?
const environment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// default to staging if environment is not defined above
const environmentToExport = typeof(environments[environment]) == 'object' ? environments[environment] : environments.staging;

environmentToExport.endpoints = endpoints;

/**** MODULE EXPORTS ****/
module.exports = environmentToExport;
