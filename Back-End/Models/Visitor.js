const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0
    },
    visits: [
        {
            ip: String,
            sessionId: String,     // For tracking browser sessions
            date: String,          // YYYY-MM-DD
            time: Date,
            pageViews: [String]    // Track which pages were viewed
        }
    ]
}, {
    timestamps: true
});

// Add index for faster queries
VisitorSchema.index({ 'visits.sessionId': 1, 'visits.date': 1 });
VisitorSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Visitor", VisitorSchema);