const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.post('/create', eventController.createEvent);
router.get('/:id/participants', eventController.getParticipants);

module.exports = router;
