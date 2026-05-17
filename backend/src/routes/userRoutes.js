const router = require("express").Router();
const { getFreelancerProfile, getFreelancerReviews, getNotifications, markNotificationsRead } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/notifications", protect, getNotifications);
router.patch("/notifications/read", protect, markNotificationsRead);
router.get("/:id", getFreelancerProfile);
router.get("/:id/reviews", getFreelancerReviews);

module.exports = router;
