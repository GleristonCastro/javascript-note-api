const express = require('express');
const router = express.Router();
const User = require('../models/user');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async function (req, res) {
  const { title, body } = req.body;
  try {
    let note = new Note({ title: title, body: body, author: req.user._id });
    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Problem to create a new note' })
  };
});

router.get('/search', withAuth, async function (req, res) {
  const { query } = req.query;
  try {
    let notes = await Note
      .find({ author: req.user._id })
      .find({ $text: { $search: query } });
      res.json(notes);
  } catch (error) {
    res.json({ error: error }).status(500);
  };
});

router.get('/:id', withAuth, async function (req, res) {
  try {
    const { id } = req.params;
    let note = await Note.findById(id);
    if (is_owner(req.user, note))
      res.json(note);
    else
      res.status(403).json({ error: 'Permission denied' });
  } catch (error) {
    res.status(500).json({ error: 'Problem to get a note' })
  };
});

router.get('/', withAuth, async function (req, res) {
  try {
    let notes = await Note.find({ author: req.user._id })
    res.json(notes);
  } catch (error) {
    res.json({ error: error }).status(500)
  };
});

router.put('/:id', withAuth, async function (req, res) {
  const { title, body } = req.body;
  const { id } = req.params;
  try {
    let note = await Note.findById(id);
    if (is_owner(req.user, note)) {
      let note = await Note.findOneAndUpdate(
        { _id: id },
        { $set: { title: title, body: body } },
        { upsert: true, 'new': true }
      );
      res.json(note);
    } else {
      res.status(403).json({ error: 'Permission denied' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Problem to update a note' })
  }
});

router.delete('/:id', withAuth, async function (req, res) {
  const { id } = req.params;
  try {
    let note = await Note.findById(id);
    if (note && is_owner(req.user, note)) {
      await note.delete();
      res.json({ message: 'OK' }).status(204);
    } else {
      res.status(403).json({ error: 'Permission denied' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Problem to delete a note' })
  }
});

const is_owner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id))
    return true;
  else
    return false;
};

module.exports = router;