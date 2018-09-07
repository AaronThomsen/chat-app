const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  timestamp: String,
  author: String,
  content: String
});

module.exports = mongoose.model('Message', messageSchema);
