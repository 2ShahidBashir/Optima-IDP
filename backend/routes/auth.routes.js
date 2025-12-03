const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validate, schemas } = require("../middleware/validate");

/**
 * AUTH ROUTES
 * --------------------------------------
 * Handles user authentication and registration.
 * 
 * Endpoints:
 * - POST /register: Create a new user account
 * - POST /login: Authenticate user and return JWT
 */

/**
 * REGISTER ROUTE
 * --------------------------------------
 * POST /api/auth/register
 * 
 * Validates user input using Joi schema (name, email, password).
 * Calls authController.register to create user in DB.
 */
router.post("/register", validate(schemas.register), authController.register);

/**
 * LOGIN ROUTE
 * --------------------------------------
 * POST /api/auth/login
 * 
 * Validates login credentials (email, password).
 * Calls authController.login to verify user and issue token.
 */
router.post("/login", validate(schemas.login), authController.login);

module.exports = router;
