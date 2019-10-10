'use-strict';

'use strict';

process.env.SECRET='test';

const Roles = require('../src/models/roles-model');
const Users = require('../src/models/users-model.js');

const jwt = require('jsonwebtoken');

const server = require('../src/server').server;
const supergoose = require('./supergoose.js');
const Q = require('@nmq/q/client');

const mockedGoose = supergoose(server);

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
  visitor: {username: 'visitor', password: 'password', role: 'visitor'},
};

const capabilities = {
  admin: ['create','read','update','delete'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
  visitor: [],
};

beforeAll(async () => {
  await Promise.all(Object.entries(capabilities).map(entry => new Roles({role: entry[0], capabilities: entry[1]}).save()));
  await Promise.all(Object.values(users).map(user => new Users(user).save()));
});

beforeEach(() => {
  jest.spyOn(Q, 'publish');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Server', () => {
  it('🍔 Responds with 404 if model not found 🍔', async () => {
    await mockedGoose
      .get('/api/v1/cats')
      .expect(404);
    
  });
});

describe.each(Object.keys(users))('%s', (username) => {
  let token;

  beforeEach(async () => {
    token = await mockedGoose.post('/signin')
      .auth(users[username].username, users[username].password)
      .then(results => results.text);
    //console.log(`Generated token for ${username}: ${token}`);
  });

  describe('/api/v1/categories', () => {
    it('🍕 Correct permission for POST /api/v1/categories 🍕', async () => {
      switch (username) {
      case 'editor':
      case 'admin':
        await mockedGoose
          .post('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Test', description: 'Description' })
          .expect(201)
          .then(result => {
            expect(result.body).toHaveProperty('_id');
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'create', {record: 'Test'});
        return;
      default:
        await mockedGoose
          .post('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Test', description: 'Description' })
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to create that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to create that resource' });
        return;
      }
    });

    it('🍜 Correct permission for GET /api/v1/categories 🍜', async () => {
      switch (username) {
      case 'visitor':
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to read that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(({body}) => {
            expect(body.results[0]).toHaveProperty('_id');
            expect(body.results[0]).toHaveProperty('name', 'Test');
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'read', 'all');
        return;
      }
    });

    it(`🍩 Correct permission for GET /api/v1/categories/:id 🍩`, async () => {
      let id;
      switch (username) {
      case 'visitor':
        await mockedGoose
          .get('/api/v1/categories/3123123123')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to read that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            id = record._id;
            return mockedGoose
              .get(`/api/v1/categories/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then(response => {
                expect(record).toStrictEqual(response.body);
              });
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'read', {id: id});
        return;
      }
    });

    it(`🍀 GET Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .get('/api/v1/categories/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .expect(username === 'visitor' ? 401 : 404);
    });

    it(`🥞 Correct permission for PUT /api/v1/categories/:id 🥞`, async () => {
      let record;
      switch(username) {
      case 'admin':
      case 'editor':
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            record = response.body.results[0];
            jest.restoreAllMocks();
            jest.spyOn(Q, 'publish');
            return mockedGoose
              .put(`/api/v1/categories/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .send({description: 'Updated, yay!'})
              .expect(200)
              .then(response => {
                expect(response.body).toHaveProperty('description', 'Updated, yay!');
              });
          });
        record.description = 'Updated, yay!';
        expect(Q.publish).toHaveBeenCalledWith('database', 'update', {id: record._id, record: {description: 'Updated, yay!'}});
        return;
      case 'user':
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            return mockedGoose
              .put(`/api/v1/categories/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .send({description: 'Updated, yay!'})
              .expect(401)
              .then(({body}) => expect(body.error).toBe('You don\'t have permission to update that resource'));
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to update that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      }
    });

    it(`🍀 PUT Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .put('/api/v1/categories/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .send({description: 'Updated, yay!'})
        .expect(username === 'admin' || username === 'editor' ? 404 : 401);
    });

    it(`🥓 Correct permission for DELETE /api/v1/categories/:id 🥓`, async () => {
      let id;
      switch(username) {
      case 'admin':
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            id = record._id;
            jest.restoreAllMocks();
            jest.spyOn(Q, 'publish');
            return mockedGoose
              .delete(`/api/v1/categories/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then(response => {
                console.log(response.body);
              });
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'delete', {id: id});
        return;
      case 'editor':
      case 'user':
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            return mockedGoose
              .delete(`/api/v1/categories/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(401)
              .then(({body}) => expect(body.error).toBe('You don\'t have permission to delete that resource'));
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', {error: 'You don\'t have permission to delete that resource'});
        return;
      default:
        await mockedGoose
          .get('/api/v1/categories')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
      }
    });

    it(`🍀 DELETE Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .delete('/api/v1/categories/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .expect(username === 'admin' ? 404 : 401);
    });
  });
  
  describe('/api/v1/products', () => {
    it('🍕 Correct permission for POST /api/v1/products 🍕', async () => {
      switch (username) {
      case 'editor':
      case 'admin':
        await mockedGoose
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .send({name: 'Test', description: 'A test product...', price: 30, stock: 10, available: true})
          .expect(201)
          .then(result => {
            expect(result.body).toHaveProperty('_id');
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'create', {record: 'Test'});
        return;
      default:
        await mockedGoose
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .send({name: 'Test', description: 'A test product...', price: 30, stock: 10, available: true})
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to create that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to create that resource' });
        return;
      }
    });

    it('🍜 Correct permission for GET /api/v1/products 🍜', async () => {
      switch (username) {
      case 'visitor':
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to read that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(({body}) => {
            expect(body.results[0]).toHaveProperty('_id');
            expect(body.results[0]).toHaveProperty('name', 'Test');
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'read', 'all');
        return;
      }
    });

    it(`🍩 Correct permission for GET /api/v1/products/:id 🍩`, async () => {
      let id;
      switch (username) {
      case 'visitor':
        await mockedGoose
          .get('/api/v1/products/3123123123')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)
          .then(({body}) => expect(body.error).toBe('You don\'t have permission to read that resource'));
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            id = record._id;
            return mockedGoose
              .get(`/api/v1/products/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then(response => {
                expect(record).toStrictEqual(response.body);
              });
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'read', {id: id});
        return;
      }
    });

    it(`🍀 GET Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .get('/api/v1/products/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .expect(username === 'visitor' ? 401 : 404);
    });

    it(`🥞 Correct permission for PUT /api/v1/products/:id 🥞`, async () => {
      let record;
      switch(username) {
      case 'admin':
      case 'editor':
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            record = response.body.results[0];
            jest.restoreAllMocks();
            jest.spyOn(Q, 'publish');
            return mockedGoose
              .put(`/api/v1/products/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .send({description: 'Updated, yay!'})
              .expect(200)
              .then(response => {
                expect(response.body).toHaveProperty('description', 'Updated, yay!');
              });
          });
        record.description = 'Updated, yay!';
        expect(Q.publish).toHaveBeenCalledWith('database', 'update', {id: record._id, record: {description: 'Updated, yay!'}});
        return;
      case 'user':
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            return mockedGoose
              .put(`/api/v1/products/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .send({description: 'Updated, yay!'})
              .expect(401)
              .then(({body}) => expect(body.error).toBe('You don\'t have permission to update that resource'));
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to update that resource' });
        return;
      default:
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
        return;
      }
    });

    it(`🍀 PUT Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .put('/api/v1/products/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .send({description: 'Updated, yay!'})
        .expect(username === 'admin' || username === 'editor' ? 404 : 401);
    });

    it(`🥓 Correct permission for DELETE /api/v1/products/:id 🥓`, async () => {
      let id;
      switch(username) {
      case 'admin':
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            id = record._id;
            jest.restoreAllMocks();
            jest.spyOn(Q, 'publish');
            return mockedGoose
              .delete(`/api/v1/products/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then(response => {
                console.log(response.body);
              });
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'delete', {id: id});
        return;
      case 'editor':
      case 'user':
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => {
            expect(response.body.count).toBeTruthy();
            const record = response.body.results[0];
            return mockedGoose
              .delete(`/api/v1/products/${record._id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(401)
              .then(({body}) => expect(body.error).toBe('You don\'t have permission to delete that resource'));
          });
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', {error: 'You don\'t have permission to delete that resource'});
        return;
      default:
        await mockedGoose
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
        expect(Q.publish).toHaveBeenCalledWith('database', 'error', { error: 'You don\'t have permission to read that resource' });
      }
    });

    it(`🍀 DELETE Will respond with 404 when ID does not exist 🍀`, () => {
      return mockedGoose
        .delete('/api/v1/products/555555555555555555555555')
        .set('Authorization', `Bearer ${token}`)
        .expect(username === 'admin' ? 404 : 401);
    });
  });
});
