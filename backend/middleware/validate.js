const Joi = require('joi');
const logger = require('../config/logger');

/**
 * Validation Middleware
 * ----------------------------------------------------
 * Validates the request body against a Joi schema.
 * 
 * @param {Object} schema - The Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
    // Validate request body, abortEarly: false returns all errors
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        // Construct error message from all validation failures
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        logger.warn(`Validation error: ${errorMessage}`);

        // Return 400 Bad Request with detailed error messages
        return res.status(400).json({
            message: 'Validation Error',
            errors: error.details.map(d => d.message)
        });
    }

    // Validation passed, proceed to controller
    next();
};

/**
 * Validation Schemas
 * ----------------------------------------------------
 * Define Joi validation rules for different routes.
 */
const schemas = {
    /**
     * Register Schema
     * Validates user registration data:
     * - name: Required, 2-50 chars
     * - email: Required, valid email format
     * - password: Required, min 6 chars
     * - role: Optional, one of 'employee', 'manager', 'admin'
     * - department: Optional string
     * - title: Optional string
     */
    register: Joi.object({
        name: Joi.string().required().min(2).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        company: Joi.string().required(),
        role: Joi.string().valid('employee', 'manager', 'admin').default('employee'),
        adminSecret: Joi.string().optional().allow(''), // Allow empty string or optional
        department: Joi.string().optional(),
        title: Joi.string().optional()
    }),

    /**
     * Login Schema
     * Validates login credentials:
     * - email: Required, valid email format
     * - password: Required string
     */
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    /**
     * Forgot Password Schema
     */
    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    /**
     * Reset Password Schema
     */
    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().required().min(8)
    })
};

module.exports = {
    validate,
    schemas
};
