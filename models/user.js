const mongoose = require('mongoose');
const path = require('path');

const defaultAvatarUrl = path.join('public', 'assets', 'avatars', 'default-avatar.png').replace(/\\/g, '/');

const userSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        default: 'user'
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'User'
    },
    avatarUrl: {
        type: String,
        required: true,
        default: defaultAvatarUrl
    },
    secret: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);