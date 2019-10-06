'use-strict';

const express = require('express');

const User = require('../models/users-model');
const auth = require('./middleware');
const google = require('./oauth/google');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', auth(), signIn);
router.post('/setrole', auth(), setRole);
router.get('/oauth', oauth);
router.post('/key', auth(), key);

function signUp(req, res, next) {
  //req.body.role = 'user'; // To prevent bug where passing in role will let you gain perms
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    })
    .catch(next);
}

function signIn(req, res) {
  res.cookie('auth', req.token);
  res.send(req.token);
}

function setRole(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(401).send('I\'m sorry, I can\'t let you do that.');
  }
  User.findOneAndUpdate({username: req.body.username}, {role: req.body.role}).then(() => {
    res.send('OK');
  });
}

function oauth(req,res,next) {
  google.authorize(req)
    .then( token => {
      res.status(200).send(token);
    })
    .catch(next);
}

function key(req,res) {
  let key = req.user.generateKey();
  res.status(200).send(key);
}

module.exports = exports = router;