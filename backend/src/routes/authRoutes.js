const router = require("express").Router();
const { body } = require("express-validator");
const { register, login, getMe, updateMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["client", "freelancer"]).withMessage("Role must be client or freelancer"),
], register);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
], login);

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, changePassword);

module.exports = router;
