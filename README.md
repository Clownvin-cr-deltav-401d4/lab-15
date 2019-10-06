# LAB - 15

## Protected Routes with Authorization
Combined Lab 8-9 (Basic Mongoose-based API) with lab 14 (access tokens and authorization)

### Author: Calvin Hall

### Links and Resources
* [submission PR](https://github.com/Clownvin-cr-deltav-401d4/lab-15/pull/1)
* [travis](https://www.travis-ci.com/Clownvin-cr-deltav-401d4/lab-15)

## Modules
### v1router
Exports a router which handles all routes, assuming that the appendModel middleware has run and attached a model to use to each request. All the APIs below use this router, but support their own model which works separately from eachother.
### find-model
Attached a model to routes with a model parameter, based on the parameter
### model-routes
Exports an express Routes object, with routes for:
* GET /api/v1/:model - Returns all documents stored in the model. Must have read access
* GET /api/v1/:model/:id - Returns the document from model with id. Must have read access
* POST /api/v1/:model - Creates a new document in the model. Must have write access
* PUT /api/v1/:model/:id - Updates a document in the model with id. Must have update access
* DELETE /api/v1/:model/:id - Deletes a document in the model with id. Must have delete access

#### Running the app
* `npm start`
  
#### Tests
* `npm test`
