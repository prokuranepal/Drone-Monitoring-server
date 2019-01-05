const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Client = new Schema({
    clientId: {
        type: String,
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    missionRequest: {
        type: Boolean,
        default: false
    },
    socketName:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Client',Client);