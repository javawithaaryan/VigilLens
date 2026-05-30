const express = require("express");
const { register, login, refreshToken, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// DigiLocker integration (placeholder for future)
router.get("/digilocker/auth", (req, res) => {
  res.json({ message: "DigiLocker integration - coming soon" });
});

router.get("/digilocker/callback", (req, res) => {
  res.json({ message: "DigiLocker callback - coming soon" });
});

module.exports = router;
