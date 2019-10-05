'use strict';

const mongoose = require('mongoose');

const categories = mongoose.Schema({
  name: String,
  description: String,
});

module.exports = mongoose.model('categories ', categories);
