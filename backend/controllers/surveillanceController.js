const SurveillanceRecord = require("../models/SurveillanceRecord");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

exports.recordFootage = async (req, res) => {
  try {
    const { citizenId, cameraId, location, duration } = req.body;

    const record = new SurveillanceRecord({
      citizenId,
      cameraId,
      location,
      duration,
      timestamp: new Date(),
      isAnonymized: true,
    });

    await record.save();

    res.status(201).json({
      message: "Footage recorded successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to record footage", error: error.message });
  }
};

exports.accessFootage = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { reason } = req.body;

    const record = await SurveillanceRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Increment access count
    record.accessCount += 1;
    await record.save();

    // Log the access
    req.auditAction = "data_access";
    req.auditTargetType = "SurveillanceRecord";
    req.auditTargetId = recordId;
    req.auditReason = reason;

    // Notify citizen
    const notification = new Notification({
      userId: record.citizenId,
      type: "footage_accessed",
      title: "Your Footage Was Accessed",
      message: `Footage from ${record.location} was accessed. Reason: ${reason || "Not specified"}`,
      relatedRecordId: recordId,
    });
    await notification.save();

    res.json({
      message: "Footage accessed",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to access footage", error: error.message });
  }
};

exports.getFootageStats = async (req, res) => {
  try {
    const totalRecords = await SurveillanceRecord.countDocuments();
    const totalAccess = await SurveillanceRecord.aggregate([
      {
        $group: {
          _id: null,
          totalAccess: { $sum: "$accessCount" },
        },
      },
    ]);

    const recordsByLocation = await SurveillanceRecord.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalRecords,
      totalAccess: totalAccess[0]?.totalAccess || 0,
      recordsByLocation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};
