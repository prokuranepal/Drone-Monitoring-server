const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DroneName = new Schema({
    drone_name:{
        type: String,
        required: true
    },
    drone_location: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('DroneName',DroneName);