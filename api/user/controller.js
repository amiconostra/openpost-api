const crypto = require('crypto');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Models
const User = require(path.join(rootdir, 'models', 'user'));
const Post = require(path.join(rootdir, 'models', 'post'));

exports.getUsers = async(req, res, next) => {
    try {
        const users = await User.find().select('-type -password -secret');
        res.status(200).json({users: users});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUser = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({_id: userId}).select(' -type-password -secret');
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({user: user});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUsername = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({_id: userId});
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({username: user.username});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUserStatus = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({_id: userId});
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({status: user.status});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUserAvatar = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({_id: userId});
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        const protocol = req.connection.encrypted ? 'https' : 'http';
        const avatarUrl = `${protocol}://${req.headers.host}/${user.avatarUrl}`
        res.status(200).json({avatar: avatarUrl});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUserSecret = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({_id: userId});
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        if(user._id.toString() !== req.userId.toString()) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        
        res.status(200).json({secret: user.secret});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.getUserPosts = async(req, res, next) => {
    const userId = req.params.userId;

    try {
        const posts = await Post.find({userId: userId}).sort({createdAt: -1});
        res.status(200).json({posts: posts});

    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};

exports.postUserPassword = (req, res, next) => {
    const userId = req.params.userId;
    const password = req.body.password;
    const userSecret = req.body.secret;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.errors = errors.array();
        throw error;
    }

    crypto.randomBytes(16, async(err, buffer) => {
        if(err) {
            const error = new Error('Failed to Generate Secret Token');
            error.statusCode = 500;
            return next(error);;
        }

        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({_id: userId});
            if(!user) {
                const error = new Error('User not Found');
                error.statusCode = 404;
                throw error;
            }
    
            if(user.secret !== userSecret) {
                const error = new Error('Invalid Secret Token');
                error.statusCode = 422;
                throw error;
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
            user.secret = token;
            await user.save();
    
            res.status(200).json({secret: user.secret});
    
        } catch(err) {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        }
    });
};