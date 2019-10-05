'use-strict';

const Categories = require('../models/categories/categories');
const Products = require('../models/products/products');
const categories = new Categories();
const products = new Products();

/**
 * Appends model to the request object, based on the request model parameter.
 * @param {*} req the request to bind the model to
 * @param {*} res the response object
 * @param {*} next the next middleware
 */
function appendModel(req, res, next) {
  let model;
  switch (req.params.model.toLowerCase()) {
  case 'categories':
    model = categories;
    break;
  case 'products':
    model = products;
    break;
  default:
    return res.status(404).json({error: `No data-model exists for "${req.params.model}"`});
  }
  req.model = model;
  next();
}

module.exports = exports = appendModel;
