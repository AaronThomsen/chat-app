const mongoose = require('mongoose');

const loggedInUsersSchema = mongoose.Schema({
  username: String,
  socketID: String
});

module.exports = mongoose.model('LoggedInUsers', loggedInUsersSchema);
