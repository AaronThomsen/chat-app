const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const socket = require('socket.io');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.Server(app);
const io = socket(server);

const User = require('./user');
const LoggedInUsers = require('./logged-in-users');
const Message = require('./message');
const port = process.env.PORT || 4000;

mongoose
  .connect(`mongodb://${process.env.MLAB_USERNAME}:${process.env.MLAB_PW}@ds245762.mlab.com:45762/chat-app`)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Failed to connect to database');
  });

app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '..', 'dist', 'index.html')));

app.post('/login', (req, res, next) => {
  let fetchedUser;
  console.log(req.body);

  User.findOne({
    username: req.body.user.username
  }).then(user => {
    if (!user) {
      return res.status(401).json({
        message: 'Username not found'
      });
    }

    fetchedUser = user;
    return bcrypt.compare(req.body.user.password, fetchedUser.password);
  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: 'Incorrect password'
      });
    }

    const newLoggedInUser = new LoggedInUsers({
      username: fetchedUser.username,
      socketID: req.body.socketID
    });

    return newLoggedInUser.save();

  }).then(results => {
    io.emit('newUser', fetchedUser.username);
    io.to(req.body.socketID).emit('newLogin_Personal');
    return res.status(200).json({
      message: 'Successful login',
      username: fetchedUser.username
    });
  })
    .catch(err => {
      return res.end();
    });
});

app.post('/register', (req, res, next) => {
  User.findOne({
    username: req.body.user.username
  }).then(user => {
    if (user) {
      return res.status(401).json({
        message: 'That username is already taken'
      });
    }

    bcrypt.hash(req.body.user.password, 10).then(hashedPassword => {

      const newUser = new User({
        username: req.body.user.username,
        password: hashedPassword
      });

      return Promise.all([
        new LoggedInUsers({username: req.body.user.username, socketID: req.body.socketID}).save(),
        newUser.save()
      ]);
    }).then(results => {
      io.emit('newUser', req.body.user.username);
      io.to(req.body.socketID).emit('newLogin_Personal');
      return res.status(201).json({
        message: `User ${req.body.user.username} successfully registered`,
        result: results[1]
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        err
      });
    });
  });
});

app.post('/logout', (req, res, next) => {
  LoggedInUsers.findOneAndDelete({username: req.body.username}).then(() => {
    io.emit('userLogout', req.body.username);
    res.status(200).json({message: 'Succesfully logged-out'});
  });
});

app.get('/loggedInUsers', (req, res, next) => {
  LoggedInUsers.find().then((users) => {
    res.status(200).json(users);
  });
});

io.on('connection', (socket) => {
  console.log(`User connected. Socket ID: ${socket.id}`);
  socket.to(socket.id).emit('newSocket', socket.id);

  Message.find().then(messages => {
    io.to(socket.id).emit('previousMessages', messages);
  });

  socket.on('newMessage', (message) => {
    const newMessage = new Message({
      timestamp: message.timestamp,
      author: message.author,
      content: message.content
    });

    newMessage.save().then((savedMessage) => {});
    io.emit('newMessage', message); //Don't need this to be async
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
    //Remove user from user list (if it exists)
    LoggedInUsers.findOneAndDelete({socketID: socket.id})
      .then((deletedSocket) => {
        if (deletedSocket) {
          io.emit('userLogout', deletedSocket.username);
          console.log(`Removed user ${deletedSocket.username} from list`);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
