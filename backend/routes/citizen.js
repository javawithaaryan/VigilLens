const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  getDashboard,
  getMyRecordings,
  getAccessHistory,
  getPrivacyScore,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/citizenController");

const router = express.Router();

router.use(authenticate);

router.get("/dashboard", authorize("citizen"), getDashboard);
router.get("/recordings", authorize("citizen"), getMyRecordings);
router.get("/access-history", authorize("citizen"), getAccessHistory);
router.get("/privacy-score", authorize("citizen"), getPrivacyScore);
router.get("/notifications", authorize("citizen"), getNotifications);
router.patch("/notifications/:notificationId", authorize("citizen"), markNotificationAsRead);

module.exports = router;
