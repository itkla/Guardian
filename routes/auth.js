const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();
const { getPGPKeys } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const { setupMFA, verifyMFA } = require("../controllers/authController");

router.post("/mfa/setup", authenticate, setupMFA);
router.post("/mfa/verify", authenticate, verifyMFA);
router.get("/pgp-keys", authenticate, getPGPKeys);
router.post("/register", register);
router.post("/login", login);
router.get("/sso/authorize", (req, res) => {
    res.redirect("http://localhost:3000/auth");
});
router.post("/sso/token", (req, res) => {
    // do this later, too lazy to type
});

module.exports = router;
