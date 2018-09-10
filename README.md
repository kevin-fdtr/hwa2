# hwa1
Node Master Class - Home Work Assignment #2 


## Endpoints

### POST /users
Creates a user based on JSON object in the request body. 

    <b>Body:</b>
    {
        "firstName": "Kevin",
        "lastName": "Sorensen",
        "emailAddress": "someone@email.com",
        "streetAddress": "123 1st Street"
    }

The response body will include the accepted user object with an id field used for later identification.

    <b>Response Body:</b>
    {
        "id": "a1b2c3d4e5f6g7h8i9j0",
        "firstName": "Kevin",
        "lastName": "Sorensen",
        "emailAddress": "someone@email.com",
        "streetAddress": "123 1st Street"
    }

### PUT /users
Updates a user based on JSON object in the request body. The token identifies the user to update. All fields but the id may be modified.

A valid token for the user must be in the request Header.

    <b>Header:</b>
    token   1a2b3c4d5e6f7g8h9i0j

    <b>Body:</b>
    {
        "firstName": "Kevin",
        "lastName": "Sorensen",
        "emailAddress": "someone@email.com",
        "streetAddress": "123 1st Street"
    }

### GET /users
Gets a user's information.

The User must be identified in the query string.

    <b>Endpoint with query string</b>
    /users?id=a1b2c3d4e5f6g7h8i9j0

The response body will include the user's information.

    <b>Response Body:</b>
    {
        "id": "a1b2c3d4e5f6g7h8i9j0",
        "firstName": "Kevin",
        "lastName": "Sorensen",
        "emailAddress": "someone@email.com",
        "streetAddress": "123 1st Street"
    }


