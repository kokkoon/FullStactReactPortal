const _ = require('lodash');
const Path = require('path-parser').default;
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Task = mongoose.model('tasks');

module.exports = app => {
  app.post('/api/tasks', requireLogin, async (req, res) => {
    const { title, description } = req.body;

    const task = new Task({
      title,
      description,
      _user: req.user.id
    });

    try {
      await task.save();

      res.send(task);
    } catch (err) {
      res.status(422).send(err);
    }
  });

  app.get('/api/tasks', requireLogin, async (req, res) => {
    const tasks = await Task.find({ _user: req.user.id }).select({
      status: false
    });

    res.send(tasks);
  });
};
