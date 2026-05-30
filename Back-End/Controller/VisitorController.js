const Visitor = require("../Models/Visitor");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

const getVisitorCount = AsyncErrorHandler(async (req, res) => {

    let visitor = await Visitor.findOne();

    if (!visitor) {
        visitor = await Visitor.create({
            count: 0,
            visits: []
        });
    }

    const today = new Date().toISOString().split("T")[0];

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

    // GET SESSION ID FROM HEADER (sent from frontend)
    const sessionId = req.headers["x-session-id"];

    let isNewSession = false;
    let shouldIncrement = false;

    // If no session ID provided, fallback to IP-based counting
    if (!sessionId) {
        console.log("⚠️ No session ID provided - counting by IP only");
        
        const alreadyVisitedToday = visitor.visits.find(
            v => v.ip === ip && v.date === today
        );

        if (!alreadyVisitedToday) {
            visitor.visits.push({
                ip,
                date: today,
                time: new Date(),
                sessionId: null
            });
            visitor.count += 1;
            await visitor.save();
        }

        return res.status(200).json({
            success: true,
            count: visitor.count,
            today,
            isNewSession: false,
            shouldIncrement: !alreadyVisitedToday,
            message: "No session ID provided - using IP-based counting"
        });
    }

    // CHECK USING SESSION ID (new logic)
    // Check if this session already visited today
    const existingVisit = visitor.visits.find(
        v => v.sessionId === sessionId && v.date === today
    );

    if (!existingVisit) {
        // Check if this session ID exists in any previous day
        const sessionExists = visitor.visits.some(v => v.sessionId === sessionId);
        
        if (!sessionExists) {
            // Completely NEW SESSION - browser was closed and reopened
            isNewSession = true;
            shouldIncrement = true;
            visitor.count += 1;
            
            console.log(`✅ NEW SESSION: ${sessionId} - Counter incremented to ${visitor.count}`);
        } else {
            // Existing session but first visit today (new day)
            console.log(`📅 EXISTING SESSION - New day: ${sessionId} - No increment`);
        }
        
        // Add visit record for today
        visitor.visits.push({
            ip,
            sessionId,
            date: today,
            time: new Date()
        });
        
        await visitor.save();
    } else {
        // Same session, same day - this is a REFRESH
        console.log(`🔄 REFRESH DETECTED: ${sessionId} - No increment`);
    }

    // Calculate additional stats
    const todayVisits = visitor.visits.filter(v => v.date === today).length;
    const uniqueSessions = new Set(visitor.visits.map(v => v.sessionId).filter(id => id)).size;

    return res.status(200).json({
        success: true,
        count: visitor.count,
        today,
        isNewSession: isNewSession,
        shouldIncrement: shouldIncrement,
        stats: {
            todayVisits: todayVisits,
            uniqueSessions: uniqueSessions,
            totalVisits: visitor.visits.length
        }
    });
});

const getVisitorGraph = AsyncErrorHandler(async (req, res) => {

    const { from, to } = req.query;

    const visitor = await Visitor.findOne();

    if (!visitor || !visitor.visits || visitor.visits.length === 0) {
        return res.status(200).json({
            success: true,
            total: 0,
            data: []
        });
    }

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    // =========================
    // FILTER VISITS
    // =========================
    let filtered = visitor.visits;

    if (fromDate || toDate) {
        filtered = visitor.visits.filter(v => {
            const visitDate = new Date(v.time);
            if (fromDate && visitDate < fromDate) return false;
            if (toDate && visitDate > toDate) return false;
            return true;
        });
    }

    // =========================
    // GROUP BY DATE
    // =========================
    const graphMap = {};

    filtered.forEach(v => {
        const date = v.date;
        if (!graphMap[date]) {
            graphMap[date] = 0;
        }
        graphMap[date]++;
    });

    // =========================
    // CONVERT OBJECT TO ARRAY
    // =========================
    const graphData = Object.entries(graphMap).map(([date, visitors]) => ({
        date,
        visitors
    }));

    // OPTIONAL SORT
    graphData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
        success: true,
        from: from || null,
        to: to || null,
        total: filtered.length,
        data: graphData
    });
});

// Track page view
const trackPageView = AsyncErrorHandler(async (req, res) => {
    const { page } = req.body;
    const sessionId = req.headers["x-session-id"];
    const today = new Date().toISOString().split("T")[0];
    
    if (!sessionId) {
        return res.status(200).json({
            success: true,
            message: "No session ID provided - page view not tracked"
        });
    }
    
    const visitor = await Visitor.findOne();
    if (visitor) {
        const visitRecord = visitor.visits.find(
            v => v.sessionId === sessionId && v.date === today
        );
        
        if (visitRecord) {
            if (!visitRecord.pageViews) {
                visitRecord.pageViews = [];
            }
            
            if (!visitRecord.pageViews.includes(page)) {
                visitRecord.pageViews.push(page);
                await visitor.save();
                console.log(`📊 Page view recorded: ${page} for session ${sessionId}`);
            }
        }
    }
    
    return res.status(200).json({
        success: true,
        message: "Page view tracked"
    });
});

// Reset visitor count (admin only)
const resetVisitorCount = AsyncErrorHandler(async (req, res) => {
    await Visitor.findOneAndUpdate(
        {},
        { count: 0, visits: [] },
        { upsert: true }
    );
    
    console.log("🔄 Visitor count has been reset");
    
    return res.status(200).json({
        success: true,
        message: "Visitor count reset successfully"
    });
});

// Get visitor stats (admin only)
const getVisitorStats = AsyncErrorHandler(async (req, res) => {
    const visitor = await Visitor.findOne();
    
    if (!visitor) {
        return res.status(200).json({
            success: true,
            stats: {
                totalCount: 0,
                totalVisits: 0,
                uniqueSessions: 0,
                todayVisits: 0
            }
        });
    }
    
    const today = new Date().toISOString().split("T")[0];
    const todayVisits = visitor.visits.filter(v => v.date === today).length;
    const uniqueSessions = new Set(visitor.visits.map(v => v.sessionId).filter(id => id)).size;
    
    return res.status(200).json({
        success: true,
        stats: {
            totalCount: visitor.count,
            totalVisits: visitor.visits.length,
            uniqueSessions: uniqueSessions,
            todayVisits: todayVisits
        }
    });
});

module.exports = { 
    getVisitorCount, 
    getVisitorGraph, 
    trackPageView, 
    resetVisitorCount, 
    getVisitorStats 
};