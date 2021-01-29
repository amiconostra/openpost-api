const path = require('path');
const rootdir = require('../../helpers/rootdir');
const { validationResult } = require('express-validator');
const fileHelper = require(path.join(rootdir, 'helpers', 'file'));

// Models
const User = require(path.join(rootdir, 'models', 'user'));
const Post = require(path.join(rootdir, 'models', 'post'));

exports.getPosts = async(req, res, next) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate('userId', '-type -password -secret');
        res.status(200).json({posts: posts});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getPost = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({_id: postId}).populate('userId', '-type -password -secret');
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({post: post});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getPostTitle = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({_id: postId});
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({title: post.title});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getPostContent = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({_id: postId});
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({content: post.content});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getPostImage = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({_id: postId});
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        const protocol = req.connection.encrypted ? 'https' : 'http';
        const imageUrl = `${protocol}://${req.headers.host}/${post.imageUrl}`
        res.status(200).json({image: imageUrl});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getPostUser = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({_id: postId}).populate('userId', '-type -password -secret');
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({user: post.userId});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.createPost = async(req, res, next) => {
    if(!req.file) {
        const error = new Error('No Image Provided');
        error.statusCode = 422;
        return next(error);
    }
    const imageUrl = req.file.path.replace(/\\/g, '/');

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        fileHelper.deleteFile(imageUrl);
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.errors = errors.array();
        return next(error);
    }
    
    const userId = req.userId;
    const title = req.body.title;
    const content = req.body.content;

    try {
        const post = new Post({title: title, content: content, imageUrl: imageUrl, userId: userId});
        await post.save();
        res.status(201).json({post: post});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.updatePost = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        if(req.file) {
            fileHelper.deleteFile(req.file.path.replace(/\\/g, '/'));
        }
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.errors = errors.array();
        return next(error);
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    if(!imageUrl) {
        const error = new Error('No Image Provided');
        error.statusCode = 422;
        return next(error);
    }

    try {
        const post = await Post.findById(postId);
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        if(post.userId.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }

        if(imageUrl !== post.imageUrl) {
            fileHelper.deleteFile(post.imageUrl);
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const updatedPost = await post.save();

        res.status(200).json({post: updatedPost});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.deletePost = async(req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        if(!post) {
            const error = new Error('Post not Found');
            error.statusCode = 404;
            throw error;
        }

        if(post.userId.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }

        fileHelper.deleteFile(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        res.status(200).json({message: 'Post has been deleted'});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};