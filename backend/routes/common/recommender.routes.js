const express = require("express");
const router = express.Router();
const recommenderController = require("../../controllers/recommender.controller");
const authMiddleware = require("../../middleware/authMiddleware");

// POST /suggestions -> Generate recommendations
router.post(
    "/suggestions",
    authMiddleware,
    recommenderController.getSuggestions
);

module.exports = router;
