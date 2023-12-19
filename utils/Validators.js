import {check, validationResult} from "express-validator";

export const registerUserValidationRules = [
    check('first_name').isLength({ min:3 }).withMessage('First name must be at least 3 characters long'),
    check('last_name').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 8 characters long'),
    check('confirm_password').isLength({ min: 5 }).withMessage('Confirm Password must be at least 8 characters long'),
];

export const loginUserValidationRules = [
    check('email').isLength({min: 1}).withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
