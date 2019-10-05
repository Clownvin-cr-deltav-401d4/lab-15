'use strict';

/**
 * Handles any fallthrough requests that don't match any routes by
 * responding with a 404 error.
 * @param {*} req the request that caused the 404
 * @param {*} res the response
 * @param {*} next the function to call the next middleware
 */
function handleNotFound(req, res, next) {
  let error = { error: 'Resource Not Found' };
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(error));
  res.end();
}
module.exports = handleNotFound;
