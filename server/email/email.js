var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nicnepal.udacity@gmail.com',
    pass: 'shrestha'
  }
});

module.exports = transporter;