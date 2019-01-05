const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Count = new Schema({
    pulchowkNo : {
        type: Number,
        default: 0
    },
    nangiNo : {
        type: Number,
        default: 0
    },
    dharanNo: {
        type: Number,
        default: 0
    },
    dhangadiNo: {
        type:Number,
        default: 0
    },
    defaultNo: {
        type:Number,
        default: 0
    }
});

module.exports = mongoose.model('Count',Count);