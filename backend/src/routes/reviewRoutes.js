const router = require("express").Router();
const { body } = require("express-validator");
const { createReview } = require("../controllers/reviewController");
const { protect, requireRole } = require("../middleware/auth");

router.post("/", protect, requireRole("client"), [
  body("jobId").isInt().withMessage("Valid job ID required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5"),
], createReview);

module.exports = router;
