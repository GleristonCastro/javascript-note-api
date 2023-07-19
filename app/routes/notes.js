const express = require('express');
const router = express.Router();
const User = require('../models/user');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async function (req, res) {
  const { title, body } = req.body;

  try {

    let note = new Note({ title: title, body: body, author: req.user._id });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(401).send(err);
  }
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
  }
});

const is_owner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id))
    return true;
  else
    return false;
}

module.exports = router;