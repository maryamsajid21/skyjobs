const router = require("express").Router();
const { body } = require("express-validator");
const { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs, completeJob } = require("../controllers/jobController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getJobs);
router.get("/my/jobs", protect, requireRole("client"), getMyJobs);
router.get("/:id", getJobById);

router.post("/", protect, requireRole("client"), [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("budgetMin").isNumeric().withMessage("Budget min must be a number"),
  body("budgetMax").isNumeric().withMessage("Budget max must be a number"),
  body("deadline").isDate().withMessage("Valid deadline required"),
], createJob);

router.put("/:id", protect, requireRole("client"), updateJob);
router.delete("/:id", protect, requireRole("client"), deleteJob);
router.patch("/:id/complete", protect, requireRole("client"), completeJob);

module.exports = router;
