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

module.exports = router;