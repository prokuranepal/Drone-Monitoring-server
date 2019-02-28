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

const JT601DroneData = mongoose.model("JT601DroneData",DroneSchema);
const JT601Count = mongoose.model("JT601Count",DroneCountSchema);

const JT602DroneData = mongoose.model("JT602DroneData",DroneSchema);
const JT602Count = mongoose.model("JT602Count",DroneCountSchema);

const JT603DroneData = mongoose.model("JT603DroneData",DroneSchema);
const JT603Count = mongoose.model("JT603Count",DroneCountSchema);

const JT604DroneData = mongoose.model("JT604DroneData",DroneSchema);
const JT604Count = mongoose.model("JT604Count",DroneCountSchema);

const JT605DroneData = mongoose.model("JT605DroneData",DroneSchema);
const JT605Count = mongoose.model("JT605Count",DroneCountSchema);


module.exports = {
    DroneData,
    JT601DroneData,
    JT602DroneData,
    JT603DroneData,
    JT604DroneData,
	JT605DroneData,
	DroneCount,
	JT601Count,
	JT602Count,
	JT603Count,
	JT604Count,
	JT605Count,
};
