'use strict';

process.env.SECRET = 'test';

const jwt = require('jsonwebtoken');

const server = require('../../src/server').server;
const supergoose = require('../supergoose');

const mockRequest = supergoose(server);
const Q = require('@nmq/q/client');

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};

describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {

    beforeEach(() => {
      jest.spyOn(Q, 'publish');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
            expect(Q.publish).toHaveBeenCalledWith('database', 'create', {model: 'users', username: users[userType].username});
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
            expect(Q.publish).toHaveBeenCalledWith('database', 'read', {model: 'users'});
          });
      });

      it('can signin with bearer', () => {
        return mockRequest.post('/signin')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
            expect(Q.publish).toHaveBeenCalledWith('database', 'read', {model: 'users'});
          });
      });

    });
    
  });
  
});