'use strict';

function hydrateNotes(input) {
  const hydrated = [], lookup = {};
  for (let note of input) {
    if (!lookup[note.id]) {
      lookup[note.id] = note;
      lookup[note.id].tags = [];
      hydrated.push(lookup[note.id]);
    }

    if (note.tag_id && note.tagName) {
      lookup[note.id].tags.push({
        id: note.tag_id,
        name: note.tagName
      });
    }
    delete lookup[note.id].tag_id;
    delete lookup[note.id].tagName;
  }
  return hydrated;
}

module.exports = hydrateNotes;