const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  createIncident,
  getIncidents,
  getIncidentDetail,
  updateIncident,
  requestIdentityReveal,
  approveIdentityReveal,
  getAuditLogs,
  getTransparencyReport,
} = require("../controllers/authorityController");

const router = express.Router();

router.use(authenticate);

// Incident Management (Officer, Supervisor, Privacy Authority)
router.post("/incidents", authorize("officer", "supervisor", "privacy_authority"), createIncident);
router.get("/incidents", authorize("officer", "supervisor", "privacy_authority"), getIncidents);
router.get("/incidents/:incidentId", authorize("officer", "supervisor", "privacy_authority"), getIncidentDetail);
router.patch("/incidents/:incidentId", authorize("officer", "supervisor", "privacy_authority"), updateIncident);

// Identity Reveal Management
router.post("/identity-reveal/request", authorize("officer", "supervisor"), requestIdentityReveal);
router.post("/identity-reveal/approve", authorize("privacy_authority"), approveIdentityReveal);

// Audit & Reports (All authority roles)
router.get("/audit-logs", authorize("officer", "supervisor", "privacy_authority"), getAuditLogs);
router.get("/transparency-report", authorize("supervisor", "privacy_authority"), getTransparencyReport);

module.exports = router;
