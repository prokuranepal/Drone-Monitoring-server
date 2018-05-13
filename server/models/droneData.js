const mongoose = require('mongoose');

var DroneSchema = new mongoose.Schema({},
{
  strict: false
});

var DroneData = mongoose.model("DroneDat", DroneSchema);

module.exports = {DroneData};
