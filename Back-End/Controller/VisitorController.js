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

    // check if same IP already visited today
    const alreadyVisitedToday = visitor.visits.find(
        v => v.ip === ip && v.date === today
    );

    if (!alreadyVisitedToday) {
        visitor.visits.push({
            ip,
            date: today,
            time: new Date()
        });

        visitor.count += 1;

        await visitor.save();
    }

    return res.status(200).json({
        success: true,
        count: visitor.count,
        today
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

module.exports = { getVisitorCount, getVisitorGraph };