// controllers/calendar/calendarController.js
const { google } = require("../../config/googleCalendarConfig");

/**
 * Get all calendars user has access to (primary + shared + subscribed)
 */
exports.getSubscribedCalendars = async (req, res) => {
  try {
    const calendar = google.calendar({
      version: "v3",
      auth: req.oauthClient,
    });

    const response = await calendar.calendarList.list();
    res.json({ calendars: response.data.items });
  } catch (err) {
    console.error("Fetch subscribed calendars error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get events of a specific calendar (default = primary),
 * now returns ALL events (past + ongoing + future).
 */
exports.getAppointments = async (req, res) => {
  try {
    const calendarId = req.query.calendarId || "primary";

    const calendar = google.calendar({
      version: "v3",
      auth: req.oauthClient,
    });

    /**
     * ✅ MAIN CHANGE:
     * Removed timeMin so we get *all events* (including past).
     */
    const response = await calendar.events.list({
      calendarId,
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
      // ❌ no timeMin so past events are included
    });

    // We don’t filter anymore — return everything
    const events = response.data.items || [];

    res.json({ events });
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create a single event in a calendar (default = primary)
 */
exports.createEvent = async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: req.oauthClient });
    const { event, calendarId = "primary" } = req.body;

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    res.json({ data: response.data });
  } catch (err) {
    console.error("Event creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Bulk insert events in a calendar (default = primary)
 */
exports.bulkInsertEvents = async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: req.oauthClient });
    const { events, calendarId = "primary" } = req.body;
    const results = [];

    for (const ev of events) {
      const r = await calendar.events.insert({
        calendarId,
        resource: ev,
      });
      results.push(r.data);
    }

    res.json({ inserted: results.length, results });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Make sure you export all four functions
module.exports = {
  getSubscribedCalendars: exports.getSubscribedCalendars,
  getAppointments: exports.getAppointments,
  createEvent: exports.createEvent,
  bulkInsertEvents: exports.bulkInsertEvents,
};
