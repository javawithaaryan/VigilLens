const Incident = require("../models/Incident");
const SurveillanceRecord = require("../models/SurveillanceRecord");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

const generateCaseNumber = async () => {
  const count = await Incident.countDocuments();
  return `CASE-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
};

exports.createIncident = async (req, res) => {
  try {
    const { location, incidentType, description, priority, relatedCitizens } = req.body;

    const caseNumber = await generateCaseNumber();

    const incident = new Incident({
      caseNumber,
      location,
      incidentType,
      description,
      priority: priority || "medium",
      status: "created",
      relatedCitizens,
      createdBy: req.user._id,
    });

    await incident.save();

    // Notify related citizens
    for (const citizenId of relatedCitizens || []) {
      const notification = new Notification({
        userId: citizenId,
        type: "investigation_started",
        title: "Investigation Started",
        message: `An investigation has been started for incident at ${location}`,
        relatedIncidentId: incident._id,
      });
      await notification.save();
    }

    // Log audit
    req.auditAction = "incident_created";
    req.auditTargetType = "Incident";
    req.auditTargetId = incident._id;
    req.auditTargetName = caseNumber;

    res.status(201).json({
      message: "Incident created successfully",
      incident,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create incident", error: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { status, priority, location } = req.query;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (location) query.location = location;

    const incidents = await Incident.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("relatedCitizens", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch incidents", error: error.message });
  }
};

exports.getIncidentDetail = async (req, res) => {
  try {
    const { incidentId } = req.params;

    const incident = await Incident.findById(incidentId)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("relatedCitizens", "name email")
      .populate("relatedRecords");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch incident", error: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status, priority, assignedTo, notes } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      {
        status,
        priority,
        assignedTo,
        $push: notes
          ? {
              notes: {
                officer: req.user._id,
                content: notes,
              },
            }
          : {},
      },
      { new: true }
    );

    req.auditAction = "incident_updated";
    req.auditTargetType = "Incident";
    req.auditTargetId = incidentId;

    res.json({
      message: "Incident updated successfully",
      incident,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update incident", error: error.message });
  }
};

exports.requestIdentityReveal = async (req, res) => {
  try {
    const { incidentId, citizenId } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      {
        $push: {
          identityRevealRequests: {
            requestedBy: req.user._id,
            requestedAt: new Date(),
            status: "pending",
            citizenId,
          },
        },
      },
      { new: true }
    );

    // Notify citizen
    const citizen = await User.findById(citizenId);
    const notification = new Notification({
      userId: citizenId,
      type: "identity_reveal_requested",
      title: "Identity Reveal Request",
      message: `Your identity has been requested in case ${incident.caseNumber}`,
      relatedIncidentId: incidentId,
    });
    await notification.save();

    req.auditAction = "identity_reveal_request";
    req.auditTargetType = "Incident";
    req.auditTargetId = incidentId;
    req.auditReason = `Identity reveal requested for citizen ${citizenId}`;

    res.json({
      message: "Identity reveal request created",
      incident,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to request identity reveal", error: error.message });
  }
};

exports.approveIdentityReveal = async (req, res) => {
  try {
    const { incidentId, requestIndex } = req.body;

    // Only privacy authority can approve
    if (req.user.role !== "privacy_authority") {
      return res.status(403).json({ message: "Only privacy authority can approve identity reveals" });
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.identityRevealRequests[requestIndex].status = "approved";
    await incident.save();

    // Notify citizen
    const citizenId = incident.identityRevealRequests[requestIndex].citizenId;
    const notification = new Notification({
      userId: citizenId,
      type: "identity_reveal_approved",
      title: "Identity Reveal Approved",
      message: `Your identity has been approved to be revealed in case ${incident.caseNumber}`,
      relatedIncidentId: incidentId,
    });
    await notification.save();

    req.auditAction = "identity_reveal_approved";
    req.auditTargetType = "Incident";
    req.auditTargetId = incidentId;

    res.json({
      message: "Identity reveal approved",
      incident,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve identity reveal", error: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};

exports.getTransparencyReport = async (req, res) => {
  try {
    const totalRecordedCitizens = await User.countDocuments({ role: "citizen" });
    const totalIncidents = await Incident.countDocuments();
    const accessRequests = await AuditLog.countDocuments({ action: "data_access" });
    const identityRevealRequests = await AuditLog.countDocuments({ action: "identity_reveal_request" });
    const approvedReveals = await AuditLog.countDocuments({ action: "identity_reveal_approved" });

    res.json({
      reportDate: new Date(),
      totalRecordedCitizens,
      totalIncidents,
      footageAccessRequests: accessRequests,
      identityRevealRequests,
      approvedReveals,
      rejectedReveals: identityRevealRequests - approvedReveals,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};
