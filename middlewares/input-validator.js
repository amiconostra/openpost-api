/*eslint indent: [2, 4, {"SwitchCase": 1}]*/

const { body } = require('express-validator');

exports.validate = (method) => {
    switch(method) {
        case 'register': {
            return [
                body('username', 'Username must be between 2-32 Characters, and can only contain Letters, and Numbers').exists().trim().isAlphanumeric().isLength({min: 2, max: 32}),
                body('password', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').exists().trim().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
            ];
        }
        case 'login': {
            return [
                body('username', 'Bad Username Input').exists().trim().not().isEmpty(),
                body('password', 'Bad Password Input').exists().trim().not().isEmpty()
            ];
        }
        case 'password': {
            return body('password', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').exists().trim().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1});
        }
        case 'status': {
            return body('status', 'Status must be Alphanumric and less 10 Characters').optional({checkFalsy: true}).trim().isAlphanumeric().isLength({max: 10})
        }
        case 'profile': {
            return [
                body('username', 'Username must be between 2-32 Characters, and can only contain Letters, and Numbers').exists().trim().isAlphanumeric().isLength({min: 2, max: 32}),
                body('password', 'Bad Password Input').optional({checkFalsy: true}).trim().isLength({min: 1}),
                body('newPassword', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').optional({checkFalsy: true}).trim().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
                body('status', 'Status must be less 10 Characters').optional({checkFalsy: true}).trim().isLength({max: 10}),
            ];
        }
        case 'post': {
            return [
                body('title', 'Post Title must be Alphanumeric And between 1-30 Characters').exists().trim().isAlphanumeric().isLength({min: 1, max: 30}),
                body('title', 'Post Title must be between 1-1000 Characters').exists().trim().isLength({min: 1, max: 1000}),
            ]
        }
    }
};