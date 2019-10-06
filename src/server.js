'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require( './middleware/error.js');
const notFound = require( './middleware/404.js' );

const authRouter = require('./auth/router');
const v1Router = require('./routes/v1router');

// Prepare the express app
const app = express();

//app.use(express.static('../docs'));
// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Routes
//app.use('/api/v1', productsRouter);
//app.use('/api/v1', categoriesRouter);
app.use(authRouter);
app.use('/api/v1', v1Router);

// Catchalls
app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => app.listen(port, () => console.log(`🍻 Server up on port: ${port} 🍻`) ),
};
