const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: String,
  description: String,
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  status: String,
  comment: String
});

mongoose.model('tasks', taskSchema);
