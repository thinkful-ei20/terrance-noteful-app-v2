'use strict';

const knex = require('../knex');

// let searchTerm = 'gaga';
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// Get Note By Id accepts an ID. It returns the note as an object not an array
// let id = '1000';
// knex
//   .select()
//   .from('notes')
//   .where('id', id)
//   .then( (results) => {
//     console.log(JSON.stringify(results[0], null, 2));
//   })
//   .catch( (err) => {
//     console.log(err);
//   });

// Update Note By Id accepts an ID and an object with the desired updates. It returns the updated note as an object
// let newId = 1005;
// let newObj = {
//   title: 'This be a new title',
//   content: 'This be some new content'
// };

// knex
//   .update(newObj)
//   .from('notes')
//   .where('id', newId)
//   .returning(['title', 'id', 'content', 'created'])
//   .then( (results) => {
//     console.log(JSON.stringify(results[0]));
//   })
//   .catch( (err) => {
//     console.log(err);
//   });

// Create a Note accepts an object with the note properties and inserts it in the DB. It returns the new note (including the new id) as an object.
// let newObj = {
//   title: 'Here is another new title',
//   content: 'Here is some more new content boi'
// };

// knex
//   .insert(newObj)
//   .from('notes')
//   .returning(['title', 'id', 'content', 'created'])
//   .then( (results) => {
//     console.log(JSON.stringify(results[0]));
//   })
//   .catch( (err) => {
//     console.log(err)
//   });

// Delete Note By Id accepts an ID and deletes the note from the DB.
// let id = 1002;

// knex
//   .where('id', id)
//   .del();