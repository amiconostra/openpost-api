const crypto = require('crypto');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Models
const User = require(path.join(rootdir, 'models', 'user'));

exports.postRegister = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.errors = errors.array();
        throw error;
    }

    crypto.randomBytes(16, async(err, buffer) => {
        if(err) {
            const error = new Error('Failed to Generate Verification Token');
            error.statusCode = 500;
            return next(error);;
        }

        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({username: username});
            if(user) {
                const error = new Error('Username Already Exists');
                error.statusCode = 422;
                throw error;
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new User({username: username, password: hashedPassword, privateToken: token});
            await newUser.save();

            res.status(201).json({message: 'User successfully registered!', privateToken: token});

        } catch(err) {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        }
    });
};

exports.postLogin = async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.errors = errors.array();
        return next(error);;
    }

    try { 
        const user = await User.findOne({username: username});
        if(!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        const matches = await bcrypt.compare(password, user.password);
        if(!matches) {
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({message: 'Login Successful', token: token});
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        return next(err);
    }
};