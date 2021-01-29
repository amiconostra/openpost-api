const express = require('express');

const authRoutes = require('./auth/routes');
const userRoutes = require('./user/routes');
const postRoutes = require('./post/routes');

const router = express.Router();

router.use('/api', authRoutes);
router.use('/api', userRoutes);
router.use('/api', postRoutes);

module.exports = router;