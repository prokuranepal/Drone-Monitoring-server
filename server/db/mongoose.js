const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connectPath = process.env.MONGODB_URI;
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
};

mongoose.connect(connectPath, options)
	.then(() => {
		console.log('successfully connected with the database ')
	},(e) => {
		console.log('authentication error in database');
	});

module.exports = mongoose;