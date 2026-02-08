const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroup);

// Protected routes
router.post('/', protect, groupController.createGroup);
router.put('/:id', protect, groupController.updateGroup);
router.delete('/:id', protect, groupController.deleteGroup);

// Membership
router.post('/:id/join', protect, groupController.joinGroup);
router.delete('/:id/leave', protect, groupController.leaveGroup);

//User's groups
router.get('/user/my-groups', protect, groupController.getUserGroups);

module.exports = router;
