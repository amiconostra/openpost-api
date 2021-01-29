const fs = require('fs');
const path = require('path');

exports.deleteFile = file => {
    file = path.join(__dirname, '..', file);
    fs.unlink(file, err => {
        if(err) {
            throw err;
        }
    });
};