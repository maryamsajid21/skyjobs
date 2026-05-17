const router = require("express").Router();
const { body } = require("express-validator");
const { submitBid, getBidsForJob, getMyBids, updateBid, withdrawBid, acceptBid } = require("../controllers/bidController");
const { protect, requireRole } = require("../middleware/auth");

router.post("/", protect, requireRole("freelancer"), [
  body("jobId").isInt().withMessage("Valid job ID required"),
  body("proposedPrice").isNumeric().withMessage("Proposed price required"),
  body("coverLetter").notEmpty().withMessage("Cover letter required"),
  body("estimatedDeliveryDays").isInt({ min: 1 }).withMessage("Delivery days required"),
], submitBid);

router.get("/my/bids", protect, requireRole("freelancer"), getMyBids);
router.get("/job/:jobId", protect, requireRole("client"), getBidsForJob);
router.put("/:id", protect, requireRole("freelancer"), updateBid);
router.delete("/:id", protect, requireRole("freelancer"), withdrawBid);
router.patch("/:id/accept", protect, requireRole("client"), acceptBid);

module.exports = router;
