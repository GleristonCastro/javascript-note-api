var express = require('express');
var router = express.Router();
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

module.exports = router;