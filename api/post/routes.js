const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const inputValidator = require(path.join(rootdir, 'middlewares', 'input-validator'));
const isAuth = require(path.join(rootdir, 'middlewares', 'authenticated'));
const upload = require(path.join(rootdir, 'config', 'multer'));

const postController = require('./controller');

const router = express.Router();

router.get('/posts', isAuth, postController.getPosts);

router.get('/posts/:postId', isAuth, postController.getPost);

router.get('/posts/:postId/title', isAuth, postController.getPostTitle);

router.get('/posts/:postId/content', isAuth, postController.getPostContent);

router.get('/posts/:postId/image', isAuth, postController.getPostImage);

router.get('/posts/:postId/user', isAuth, postController.getPostUser);

router.post('/posts/new', isAuth, upload.single('image'), inputValidator.validate('post'), postController.createPost);

router.put('/posts/:postId', isAuth, upload.single('image'), inputValidator.validate('post'), postController.updatePost);

router.delete('/posts/:postId', isAuth, postController.deletePost);

module.exports = router;