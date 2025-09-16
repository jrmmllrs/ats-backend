const express = require("express");
const router = express.Router();
const { setCredentialsFromCookies } = require("../../middlewares/calendarAuthMiddleware");
const {
  getAppointments,
  createEvent,
  bulkInsertEvents,
} = require("../../controllers/calendar/calendarController");

router.get("/appointments", setCredentialsFromCookies, getAppointments);
router.post("/event", setCredentialsFromCookies, createEvent);
router.post("/events/bulk", setCredentialsFromCookies, bulkInsertEvents);

module.exports = router;
