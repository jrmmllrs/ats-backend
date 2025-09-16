const { google } = require("../../config/googleCalendarConfig");

exports.getAppointments = async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: req.oauthClient });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 20,
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
    const { event } = req.body;

    const response = await calendar.events.insert({
      calendarId: "primary",
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
    const { events } = req.body;
    const results = [];

    for (const ev of events) {
      const r = await calendar.events.insert({
        calendarId: "primary",
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
