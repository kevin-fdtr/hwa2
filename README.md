# HWA2
Node Master Class - Home Work Assignment #2 


## Endpoints

This is a RESTful API server. 

The server documents it's endpoint configuration at the GET /api endpoint. (see below)

Endpoints are configured in JSON files in the server's .data/api folder, one file for each endpoint.

Endpoints setup in the configuration that do not have corresponding handlers in the server code (/lib/handlers/index.js) will result in a 404 (not found) response from the server and will not be listed from the GET /api endpoint.

Endpoints can be removed from configuration without removing them in the server code. Trying to access an endpoint that is not configured will result in a 404 (not found) response from the server, whether or not there is server code supporting it. Endpoints can be temporarily turned off this way.

TODO: Each endpoint method will return the configuration for the endpoint method if the endpoint is not used correctly.

### GET /api
This endpoint returns configuration data for all the server's endpoints. 

The configuration is loaded from the same configuration data as is used by the server to process requests.

The returned JSON object includes a property key named for each endpoint. Each endpoint property is set to an endpoint object.

    {
        "api": {},
        "users": {}
    }

#### Endpoint Object
Each endpoint object defines the url path of the endpoint and contains an array of available methods objects:

    {
        "url": "/api",
        "methods": [{}]
    }

#### Method Object
Each methods object includes the supported method and name properties and string arrays of required headerKeyParameters and queryParameters:

    {
        "method": "get",
        "name": "get a user's properties",
        "headerKeyParameters": [
            "token"
        ],
        "queryParameters": [
            "id"
        ]
    },

If the method requires body data, the method object will also include a requiredBodyData array of objects detailing the key value name and data type:

    {
        "requiredBodyData": [
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "emailAddress",
                "type": "string"
            },
            {
                "name": "streetAddress",
                "type": "string"
            }
        ]
    }

If the method has optional body parameters, the method object will also include a optionalBodyData array of objects detailing the key value name and data type:

    {
        "optionalBodyData": [
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "emailAddress",
                "type": "string"
            },
            {
                "name": "streetAddress",
                "type": "string"
            }
        ]
    }

TODO: Do not list method objects that are not available in code on the server (like end points are not listed if not available in code on the server)