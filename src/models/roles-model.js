'use strict';

const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
  role: {type: String, required:true},
  capabilities: {type: Array, required:true},
});

const Roles = mongoose.model('roles', rolesSchema);

module.exports = Roles;
