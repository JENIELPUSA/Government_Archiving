const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0
    },

    visits: [
        {
            ip: String,
            date: String, // YYYY-MM-DD
            time: Date
        }
    ]
});

module.exports = mongoose.model("Visitor", VisitorSchema);