var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var connectPath = process.env.MONGODB_URI;
var options = {};

mongoose.connect(connectPath, options).then(
  () => console.log('sucessfully connected with the database '),
  (e) => {
    console.log('authentication error');
  });

module.exports = {
  mongoose
};
