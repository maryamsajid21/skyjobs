const router = require("express").Router();
const { getStats, getAllUsers, suspendUser, activateUser, deleteUser, getAllJobs, deleteJob } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/activate", activateUser);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);

module.exports = router;
