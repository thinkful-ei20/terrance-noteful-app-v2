'use strict';

const express = require('express');

const knex = require('../knex');

const router = express.Router();

//get all folders no searchterm needed
router.get('/folders', (req, res, next) => {
  knex.select('folders.id', 'name')
    .from('folders')
    .orderBy('folders.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single folder
router.get('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select()
    .from('folders')
    .where('id', id)
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

// Put update a folder
router.put('/folders/:id', (req, res, next) => {
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
    .from('folders')
    .where('id', id)
    .returning(['id', 'name'])
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

module.exports = router;