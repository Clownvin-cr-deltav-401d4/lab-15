'use-strict';

const express = require('express');

const appendModel = require('../middleware/model-finder');
const auth = require('../auth/middleware');

const router = express.Router();

const Q = require('@nmq/q/client');

router.param('model', appendModel);

router.get('/:model', auth('read'), getAllHandler);
router.post('/:model', auth('create'), postHandler);
router.get('/:model/:id', auth('read'), getHandler);
router.put('/:model/:id', auth('update'), putHandler);
router.delete('/:model/:id', auth('delete'), deleteHandler);

/**
 * Sends a result, and handles if the result was null by sending a 500
 * @param {*} result the result obtained from the DB
 * @param {*} res the res object for the connection
 * @param {*} status the status code, default 200
 * @param {*} id the ID that was used
 */
function sendResult(result, res, status = 200, id) {
  if (!result && id) {
    return respondWith404(id, res);
  } else if (!result) {
    const error = {error: 'Internal server error: Result was null without passing ID.'};
    Q.publish('database', 'error', error);
    return res.status(500).json({error: 'Internal server error: Result was null without passing ID.'});
  }
  res.status(status).json(result);
}

/**
 * Responds to a request with a 404
 * @param {*} id the ID that caused the error
 * @param {*} res the response object
 */
function respondWith404(id, res) {
  const error = {error: `No item exists with id ${id}`};
  Q.publish('database', 'error', error);
  res.status(404).json(error);
}

/**
 * Gets all the entries for a given model
 * @route GET /api/v1/get/:model
 * @group everyone - Ops about user
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next calls the next middleware
 */
function getAllHandler(req, res, next) {
  req.model.get()
    .then(result => sendResult({count: result.length, results: result}, res, 200))
    .catch(next);
}

/**
 * Posts a new entry to a given model
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next calls the next middleware
 */
function postHandler(req, res, next) {
  req.model.post(req.body)
    .then(result => sendResult(result, res, 201))
    .catch(next);
}

/**
 * Gets an entry from a model by an ID
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next calls the next middleware
 */
function getHandler(req, res, next) {
  req.model.get(req.params.id)
    .then(result => sendResult(result, res, 200, req.params.id))
    .catch(next);
}

/**
 * Updates an entry with new information for a given ID
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next calls the next middleware
 */
function putHandler(req, res, next) {
  req.model.put(req.params.id, req.body)
    .then(result => sendResult(result, res, 200, req.params.id))
    .catch(next);
}

/**
 * Deletes an entry for the given ID
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next calls the next middleware
 */
function deleteHandler(req, res, next) {
  req.model.delete(req.params.id)
    .then(result => sendResult(result, res, 200, req.params.id))
    .catch(next);
}

module.exports = exports = router;
