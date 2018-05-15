var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var username = 'raj778';
var password = 'r@j777';

var connectPath = process.env.MONGODB_URI;
var options = {};


mongoose.connect(connectPath, options).then(
  () => console.log('sucessfully connected'),
  (e) => {
    console.log('authentication error');
  });

module.exports = {
  mongoose
};
