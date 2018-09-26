const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({}, {
  strict: false
});

const PulchowkDroneSchema = new mongoose.Schema({}, {
  strict: false
});

const NangiDroneSchema = new mongoose.Schema({},{
  strict: false
});

const DharanDroneSchema = new mongoose.Schema({},{
    strict: false
});

const DhangadiDroneSchema = new mongoose.Schema({},{
    strict: false
});


const DroneData = mongoose.model("DroneData", DroneSchema);
const PulchowkDroneData = mongoose.model("PulchowkDroneData",PulchowkDroneSchema);
const NangiDroneData = mongoose.model("NangiDroneData",NangiDroneSchema);
const DharanDroneData = mongoose.model("DharanDroneData",DharanDroneSchema);
const DhangadiDroneData = mongoose.model("DhangadiDroneData",DhangadiDroneSchema);

module.exports = {
    DroneData,
    PulchowkDroneData,
    NangiDroneData,
    DharanDroneData,
    DhangadiDroneData
};
