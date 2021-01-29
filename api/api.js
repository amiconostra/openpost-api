const express = require('express');

const authRoutes = require('./auth/routes');

const router = express.Router();

router.use('/api/auth', authRoutes);

module.exports = router;