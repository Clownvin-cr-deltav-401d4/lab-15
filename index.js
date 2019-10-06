'use strict';

require('dotenv').config();

// Start DB Server
const mongoose = require('mongoose');
const mongooseOptions = {
  useNewUrlParser:true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

const Roles = require('./src/models/roles-model');

const capabilities = {
  admin: ['create','read','update','delete'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

for (const role in capabilities) {
  Roles.findOne({role: role})
    .then(result => {
      if (!result) {
        const document = new Roles({role: role, capabilities: capabilities[role]});
        document.save();
      } else {
        console.log(result);
      }
    });
}

require('./src/server.js').start(process.env.PORT);
