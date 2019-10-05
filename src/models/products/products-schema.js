'use strict';

const mongoose = require('mongoose');

// What fields and constraints do we want?
const products = mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  available: Boolean,
});

// Do we need to run any lifecycle hooks/middleware?

module.exports = exports = mongoose.model('products ', products);
