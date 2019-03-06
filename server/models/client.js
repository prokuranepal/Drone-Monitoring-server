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
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1d' },
    },

});

module.exports = mongoose.model('Client',Client);