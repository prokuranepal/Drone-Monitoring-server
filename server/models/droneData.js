const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({}, {
	strict: false
});

const DroneCountSchema = new mongoose.Schema({
	count_value : {
	type: Number,
	required : true,
	default: 0
	}
});

const DroneData = mongoose.model("DroneData", DroneSchema);
const DroneCount = mongoose.model("DroneCount",DroneCountSchema);

module.exports.DroneData = DroneData;
module.exports.DroneCount = DroneCount;

const JT601DroneData = mongoose.model("JT601DroneData",DroneSchema);
const JT601Count = mongoose.model("JT601Count",DroneCountSchema);

module.exports.JT601DroneData = JT601DroneData;
module.exports.JT601Count = JT601Count;

const JT602DroneData = mongoose.model("JT602DroneData",DroneSchema);
const JT602Count = mongoose.model("JT602Count",DroneCountSchema);

module.exports.JT602DroneData = JT602DroneData;
module.exports.JT602Count = JT602Count;

const JT603DroneData = mongoose.model("JT603DroneData",DroneSchema);
const JT603Count = mongoose.model("JT603Count",DroneCountSchema);

module.exports.JT603DroneData = JT603DroneData;
module.exports.JT603Count = JT603Count;

const JT604DroneData = mongoose.model("JT604DroneData",DroneSchema);
const JT604Count = mongoose.model("JT604Count",DroneCountSchema);

module.exports.JT604DroneData = JT604DroneData;
module.exports.JT604Count = JT604Count;
