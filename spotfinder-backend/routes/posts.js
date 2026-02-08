const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Protected routes
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

// Voting
router.post('/:id/vote', protect, postController.votePost);
router.delete('/:id/vote', protect, postController.removeVote);

// Comments
router.post('/:id/comments', protect, postController.addComment);

// User's posts
router.get('/user/my-posts', protect, postController.getUserPosts);

module.exports = router;
