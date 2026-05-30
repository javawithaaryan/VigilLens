const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { recordFootage, accessFootage, getFootageStats } = require("../controllers/surveillanceController");

const router = express.Router();

// Record footage (from camera systems)
router.post("/record", recordFootage);

// Access footage
router.get("/:recordId", authenticate, authorize("officer", "supervisor", "privacy_authority"), accessFootage);

// Get statistics
router.get("/stats", authenticate, authorize("officer", "supervisor", "privacy_authority"), getFootageStats);

module.exports = router;
