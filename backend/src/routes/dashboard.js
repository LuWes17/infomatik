const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDashboardStatistics } = require('../controllers/dashboardController');

router.get('/statistics', protect, adminOnly, getDashboardStatistics);

module.exports = router;