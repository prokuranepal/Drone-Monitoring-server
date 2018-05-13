var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var username = 'raj778';
var password = 'r@j777';


var connectPath, options;
if (process.env.NODE_ENV === 'production') {
  console.log('i am in heroku');
  connectPath = "mongodb://ds119080.mlab.com:19080/nicdb";
  options = {
    auth: {
      user: username,
      password: password
    }
  }

} else {
  console.log('using local db');
  connectPath = process.env.MONGODB_URI;
  options = {}

}

mongoose.connect(connectPath, options).then(() => console.log('sucessfully connected'),
  (e) => {
    console.log('authentication error');
  });

module.exports = {
  mongoose
};
