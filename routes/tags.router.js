'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();

/* ========== GET ALL TAGS ========== */
router.get('/tags', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

/* ========== GET TAG BY ID ========== */
router.get('/tags/:id', (req, res, next) => {
  knex.first('id', 'name')
    .where('id', req.params.id)
    .from('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));
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
    .then( ([results]) => {
      res.json(results);
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
