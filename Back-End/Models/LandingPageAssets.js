const mongoose = require("mongoose");

const LandingPage = new mongoose.Schema({
    title: {
        type: String
    },
    subtitle: {
        type: String
    },
    Mission: {
        type: String
    },
    Vission: {
        type: String
    },
    avatar: [
        {
            url: String,
            public_id: String,
            priorityNumber: Number,
        }
    ],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("LandingPage", LandingPage);