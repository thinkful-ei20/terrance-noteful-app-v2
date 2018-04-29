'use strict';

/**
 * DISCLAIMER:
 * The examples shown below are superficial tests which only check the API responses.
 * They do not verify the responses against the data in the database. We will learn
 * how to crosscheck the API responses against the database in a later exercise.
 */
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const seedData = require('../db/seedData');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('connection should be test database', () => {
    expect(knex.client.connectionSettings.database).to.equal('noteful-test');
  });

});

describe('Noteful App', function () {

  beforeEach(function () {
    return seedData('./db/noteful.sql', 'postgres');
  });

  after(function () {
    return knex.destroy(); // destroy the connection
  });

  describe('Static app', function () {

    it('GET request "/" should return the index page', function () {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      return chai.request(app)
        .get('/bad/path')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('GET /api/notes', function () {

    it('should return the default of 10 Notes ', function () {
      let count;
      return knex.count()
        .from('notes')
        .then( ([result]) => {
          count = Number(result.count);
          return chai.request(app).get('/api/notes');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(count);
        });
    });

    it('should return a list with the correct right fields', function () {
      let res;
      return chai.request(app)
        .get('/api/notes')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('notes').select();
        })
        .then( (data) => {
          expect(res.body).to.have.length(data.length);
          for (let i = 0; i < data.length; i++) {
            expect(res.body[i].id).to.equal(data[i].id);
            expect(res.body[i].title).to.equal(data[i].title);
          }
        });
    });

    it('should return correct search results for a valid query', function () {
      let res;
      return chai.request(app).get('/api/notes?searchTerm=gaga')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          return knex.select().from('notes').where('title', 'like', '%gaga%');
        })
        .then( (data) => {
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });

    it('should return an empty array for an incorrect query', function () {
      let res;
      return chai.request(app)
        .get('/api/notes?searchTerm=Not%20a%20Valid%20Search')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('notes').count().where('title', 'like', '%not_a_valid_search%');
        })
        .then( ([ result ]) => {
          let count = Number(result.count);
          expect(res.body).to.have.length(count);
        });
    });
  });

  describe('GET /api/folders', function() {

    it('should return the default count of folders', function() {
      let count;
      return knex.count()
        .from('folders')
        .then( ([result]) => {
          count = Number(result.count);
          return chai.request(app).get('/api/folders');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(count);
        });
    });

    it('should return a list with the correct right fields', function () {
      let res;
      return chai.request(app)
        .get('/api/folders')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('folders').select();
        })
        .then( (data) => {
          expect(res.body).to.have.length(data.length);
          for (let i = 0; i < data.length; i++) {
            expect(res.body[i].id).to.equal(data[i].id);
            expect(res.body[i].name).to.equal(data[i].name);
          }
        });
    });

  });

  describe('GET /api/tags', function() {

    it('should return the default count of tags', function() {
      let count;
      return knex.count()
        .from('tags')
        .then( ([result]) => {
          count = Number(result.count);
          return chai.request(app).get('/api/tags');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(count);
        });
    });

    it('should return a list with the correct right fields', function () {
      let res;
      return chai.request(app)
        .get('/api/tags')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('tags').select();
        })
        .then( (data) => {
          expect(res.body).to.have.length(data.length);
          for (let i = 0; i < data.length; i++) {
            expect(res.body[i].id).to.equal(data[i].id);
            expect(res.body[i].name).to.equal(data[i].name);
          }
        });
    });

  });

  describe('GET /api/notes/:id', function () {

    it('should return correct notes', function () {

      const dataPromise = knex.first()
        .from('notes')
        .where('id', 1000);

      const apiPromise = chai.request(app)
        .get('/api/notes/1000');

      return Promise.all([dataPromise, apiPromise])
        .then(function ([data, res]) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(1000);
          expect(res.body.title).to.equal(data.title);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .then(res => {
          expect(res).to.have.status(404);
          return knex('notes').select().where('id', '99999999');
        })
        .then( (data) => {
          expect(data.length).to.equal(0);
        });
    });

  });

  describe('GET /api/folders/:id', function () {

    it('should return correct folders', function () {

      const dataPromise = knex.first()
        .from('folders')
        .where('id', 100);

      const apiPromise = chai.request(app)
        .get('/api/folders/100');

      return Promise.all([dataPromise, apiPromise])
        .then(function ([data, res]) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.id).to.equal(100);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .then(res => {
          expect(res).to.have.status(404);
          return knex('folders').select().where('id', '99999999');
        })
        .then( (data) => {
          expect(data.length).to.equal(0);
        });
    });

  });

  describe('GET /api/tags/:id', function () {

    it('should return correct tags', function () {

      const dataPromise = knex.first()
        .from('tags')
        .where('id', 1);

      const apiPromise = chai.request(app)
        .get('/api/tags/1');

      return Promise.all([dataPromise, apiPromise])
        .then(function ([data, res]) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.id).to.equal(1);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .then(res => {
          expect(res).to.have.status(404);
          return knex('tags').select().where('id', '99999999');
        })
        .then( (data) => {
          expect(data.length).to.equal(0);
        });
    });

  });

  describe('POST /api/notes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folder_id');
          expect(res).to.have.header('location');
          return knex.select().from('notes').where('id', body.id);
        })
        .then( ([data]) => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
          expect(body.folder_id).to.equal(data.folder_id);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when missing "title" field', function () {
      const newItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then( (res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return knex('notes')
            .insert(newItem)
            .catch( (err) => {
              return err;
            });
        })
        .then( (err) => {
          expect(err).to.include({name: 'error'});
        });
    });

  });

  describe('POST /api/folders', function () {

    it('should create and return a new item when provided valid data', function () {

      const newItem = {
        'name': 'This is a test'
      };

      let body;
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res).to.have.header('location');
          return knex.select().from('folders').where('id', body.id);
        })
        .then( ([data]) => {
          expect(body.name).to.equal(data.name);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then( (res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
          return knex('folders')
            .insert(newItem)
            .catch( (err) => {
              return err;
            });
        })
        .then( (err) => {
          expect(err).to.include({name: 'error'});
        });
    });

  });

  describe('POST /api/tags', function () {

    it('should create and return a new item when provided valid data', function () {

      const newItem = {
        'name': 'This is a test'
      };

      let body;
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res).to.have.header('location');
          return knex.select().from('tags').where('id', body.id);
        })
        .then( ([data]) => {
          expect(body.name).to.equal(data.name);
          expect(body.id).to.equal(data.id);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then( (res) => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
          return knex('tags')
            .insert(newItem)
            .catch( (err) => {
              return err;
            });
        })
        .then( (err) => {
          expect(err).to.include({name: 'error'});
        });
    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update the note', function () {
      let id = 1000;
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      let body;
      return chai.request(app)
        .put(`/api/notes/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
          return knex('notes').where({'notes.id': res.body.id});
        })
        .then(([res])=> {
          expect(res.title).to.equal(body.title);
          expect(res.content).to.equal(body.content);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      return chai.request(app)
        .put('/DOES/NOT/EXIST')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
          return knex.update(updateItem).from('notes').where('id', '999999999');
        })
        .then( (count) => {
          expect(count).to.equal(0);
        });
    });

    it('should return an error when missing "title" field', function () {
      const updateItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .put('/api/notes/1005')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return knex('notes')
            .insert(updateItem)
            .catch( (err) => {
              return err;
            });
        })
        .then( (err) => {
          expect(err).to.include({name: 'error'});
        });
    });

  });

  describe('PUT /api/folders/:id', function () {

    it('should update the folder', function () {
      let id = 100;
      const updateItem = {
        'name': 'this is a new folder name'
      };
      let body;
      return chai.request(app)
        .put(`/api/folders/${id}`)
        .send(updateItem)
        .then(res => {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.id).to.equal(id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
          return knex('folders').where({'folders.id': res.body.id});
        })
        .then(([res])=> {
          expect(res.title).to.equal(body.title);
          expect(res.content).to.equal(body.content);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'name': 'new folder name'
      };
      return chai.request(app)
        .put('/DOES/NOT/EXIST')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
          return knex.update(updateItem).from('folders').where('id', '999999999');
        })
        .then( (count) => {
          expect(count).to.equal(0);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .put('/api/folders/102')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
          return knex('folders')
            .insert(updateItem)
            .catch( (err) => {
              return err;
            });
        })
        .then( (err) => {
          expect(err).to.include({name: 'error'});
        });
    });

  });

  describe('DELETE  /api/notes/:id', function () {

    it('should delete an item by id', function () {

      return chai.request(app)
        .delete('/api/notes/1005')
        .then( (res) => {
          expect(res).to.have.status(204);
          return knex('notes').select()
            .where('id', 1005);
        })
        .then( (result) => {
          expect(result).to.have.length(0);
        });
    });
  });
});