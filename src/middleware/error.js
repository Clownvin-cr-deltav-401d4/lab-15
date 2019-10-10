'use strict';

const Q = require('@nmq/q/client');

/**
 * Handles any uncaught errors by responding with a 500
 * @param {*} err the uncaught error
 * @param {*} req the request that caused the error
 * @param {*} res the response
 * @param {*} next the function to call the next middleware
 */
function handleError(err, req, res, next) {
  req.lint = null;
  next.lint = null;
  console.log(err);
  let error = { error: err.message || err };
  console.log('Emitting error', JSON.stringify(err));
  Q.publish('database', 'error', error);
  res.statusCode = err.status || 500;
  res.statusMessage = 'Server Error';
  res.setHeader('Content-Type', 'application/json');
  res.write( JSON.stringify(error) );
  res.end();
}

module.exports = handleError;
