'use strict';

const mongoose = require('mongoose');

const Q = require('@nmq/q/client');

const rolesSchema = new mongoose.Schema({
  role: {type: String, required:true},
  capabilities: {type: Array, required:true},
});

rolesSchema.post('findOne', function () {
  Q.publish('database', 'read', {model: 'roles'});
});

rolesSchema.post('save', async function() {
  Q.publish('database', 'create', {model: 'roles', role: this.role});
});

const Roles = mongoose.model('roles', rolesSchema);

module.exports = Roles;
