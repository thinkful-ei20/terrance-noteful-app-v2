'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

const knex = require('../knex');

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  knex.select('notes.id', 'title', 'content')
    .from('notes')
    .modify( (queryBuilder) => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select()
    .from('notes')
    .where('id', id)
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .update(updateObj)
    .from('notes')
    .where('id', id)
    .returning(['title', 'id', 'content', 'created'])
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newItem)
    .from('notes')
    .returning(['title', 'id', 'content', 'created'])
    .then( (results) => {
      res.status(201).json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('notes')
    .where('id', id)
    .del()
    .then( () => {
      res.sendStatus(204);
    })
    .catch( (err) => {
      next(err);
    });
});

module.exports = router;