'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();

/* ========== GET ALL TAGS ========== */
router.get('/tags', (req, res, next) => {
  const { searchTerm } = req.query;

  knex
    .select()
    .from('tags')
    .returning('name', 'id')
    .modify( (queryBuilder) => {
      if (searchTerm) {
        queryBuilder.where('name', 'like', `%${searchTerm}%`);
      }
    })
    .then( (result) => {
      res.location(`${req.originalUrl}/${result.id}`).status(200).json(result);
    })
    .catch(err => next(err));
});

/* ========== GET TAG BY ID ========== */
router.get('/tags/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select()
    .from('tags')
    .where('id', id)
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

/* ========== POST/CREATE TAG ========== */
router.post('/tags', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

/* ========== UPDATE TAG BY ID ========== */
router.put('/tags/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .update(updateObj)
    .from('tags')
    .where('id', id)
    .returning(['id', 'name'])
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

/* ========== DELETE TAG BY ID ========== */
router.delete('/tags/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('tags')
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
