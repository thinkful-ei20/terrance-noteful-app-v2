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
  const { folderId } = req.query;

  knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify( (queryBuilder) => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify( (queryBuilder) => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
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
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', id)
    .then( (results) => {
      res.json(results[0]);
    })
    .catch( (err) => {
      next(err);
    });
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content, folderId } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title,
    content,
    folder_id: folderId
  };

  knex
    .update(updateItem)
    .from('notes')
    .where('id', noteId)
    .returning(['id'])
    .then( () => {
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then( ([result]) => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch( (err) => {
      next(err);
    });
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id } = req.body;

  const newItem = { title, content, folder_id };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then( ([id]) => {
      noteId = id;
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then( ([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
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
