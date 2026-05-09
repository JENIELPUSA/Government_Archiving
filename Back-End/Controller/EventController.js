const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Event = require("./../Models/EventSchema");

// CREATE EVENT
exports.createEvent = AsyncErrorHandler(async (req, res) => {
  const event = await Event.create(req.body);

  res.status(201).json({
    status: "success",
    data: event,
  });
});

// DISPLAY EVENTS WITH PAGINATION + SEARCH
exports.DisplayEvent = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = (req.query.search || "").trim();
  const skip = (page - 1) * limit;

  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { time: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const events = await Event.find(filter)
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Event.countDocuments(filter);

  res.status(200).json({
    status: "success",
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    data: events,
  });
});

exports.DisplayEventbymonth = AsyncErrorHandler(async (req, res) => {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const events = await Event.find({
    date: { $gte: startOfMonth }, // no past events
  }).sort({ date: 1, time: 1 });

  res.status(200).json({
    status: "success",
    data: events,
  });
});

// DISPLAY SINGLE EVENT
exports.DisplaySingleEvent = AsyncErrorHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      status: "fail",
      message: "Event not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: event,
  });
});

// UPDATE EVENT
exports.UpdateEvent = AsyncErrorHandler(async (req, res) => {
  const updateEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updateEvent) {
    return res.status(404).json({
      status: "fail",
      message: "Event not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: updateEvent,
  });
});

// DELETE EVENT
exports.deleteEvent = AsyncErrorHandler(async (req, res) => {
  const deletedEvent = await Event.findByIdAndDelete(req.params.id);

  if (!deletedEvent) {
    return res.status(404).json({
      status: "fail",
      message: "Event not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});