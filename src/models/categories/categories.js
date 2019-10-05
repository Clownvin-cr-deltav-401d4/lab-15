'use strict';

const Model = require('../mongo.js');
const schema = require('./categories-schema.js');

// How can we connect ourselves to the mongo interface?
// What do we export?

class Categories extends Model {
  constructor() {
    super(schema);
  }
}

module.exports = exports = Categories;
