const express = require("express");
const router = express.Router();
const { getSummary, getMonthly, getCategories } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, getSummary);
router.get("/monthly", protect, getMonthly);
router.get("/categories", protect, getCategories);

module.exports = router;