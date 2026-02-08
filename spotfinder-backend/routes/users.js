const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Profile routes
router.get('/profile', protect, userController.getProfile);
router.get('/profile/:userId', userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// Follow routes
router.post('/:userId/follow', protect, userController.followUser);
router.delete('/:userId/unfollow', protect, userController.unfollowUser);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

// Activity feed
router.get('/activity-feed', protect, userController.getActivityFeed);

module.exports = router;
