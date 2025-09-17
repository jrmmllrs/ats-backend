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
 * Get events of a specific calendar (default = primary)
 */
exports.getAppointments = async (req, res) => {
  try {
    const calendarId = req.query.calendarId || "primary";

    const calendar = google.calendar({
      version: "v3",
      auth: req.oauthClient,
    });

    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json({ events: response.data.items });
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ error: err.message });
  }
};

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
