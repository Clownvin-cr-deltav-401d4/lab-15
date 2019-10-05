# LAB - 8-9

## Routes and Supergoose tests - JSDoc and Swagger

### Author: Calvin Hall

### Links and Resources
* [submission PR](https://github.com/Clownvin-cr-deltav-401d4/lab-08/pull/1)
* [travis](https://www.travis-ci.com/Clownvin-cr-deltav-401d4/lab-08)
* [back-end](https://clownvins-lab-9.herokuapp.com/api/v1)

## Modules
### v1router
Exports a router which handles all routes, assuming that the appendModel middleware has run and attached a model to use to each request. All the APIs below use this router, but support their own model which works separately from eachother.
### categories-routes
Exports an express Routes object, with routes for:
* GET /api/v1/categories - Returns all categories
* GET /api/v1/categories/:id - Returns the category with id
* POST /api/v1/categories - Creates a new category
* PUT /api/v1/categories/:id - Updates a category with id
* DELETE /api/v1/categories/:id - Deletes a category with id

### products-routes
Exports an express Routes object, with routes for:
* GET /api/v1/products - Returns all products
* GET /api/v1/products/:id - Returns the product with id
* POST /api/v1/products - Creates a new product
* PUT /api/v1/products/:id - Updates a product with id
* DELETE /api/v1/products/:id - Deletes a product with id

#### Running the app
* `npm run start`
  
#### Tests
* `npm test`