const User = require("../models/User");
const SurveillanceRecord = require("../models/SurveillanceRecord");
const AuditLog = require("../models/AuditLog");

const calculatePrivacyScore = async (userId) => {
  try {
    const records = await SurveillanceRecord.countDocuments({ citizenId: userId });
    const accessCount = await SurveillanceRecord.aggregate([
      { $match: { citizenId: userId } },
      { $group: { _id: null, total: { $sum: "$accessCount" } } },
    ]);

    const auditLogs = await AuditLog.countDocuments({
      userId,
      action: "data_access",
    });

    let score = 100;
    score -= Math.min(records * 2, 30);
    score -= Math.min(accessCount[0]?.total * 5 || 0, 30);
    score -= Math.min(auditLogs * 3, 20);

    return Math.max(0, score);
  } catch (error) {
    console.error("Error calculating privacy score:", error);
    return 100;
  }
};

const getPrivacyReport = async (userId) => {
  try {
    const records = await SurveillanceRecord.find({ citizenId: userId }).sort({ createdAt: -1 });

    const privacyScore = await calculatePrivacyScore(userId);

    const recordsByLocation = {};
    records.forEach((record) => {
      if (!recordsByLocation[record.location]) {
        recordsByLocation[record.location] = 0;
      }
      recordsByLocation[record.location]++;
    });

    return {
      privacyScore,
      totalRecordings: records.length,
      locationsCaptured: Object.keys(recordsByLocation),
      recordsByLocation,
      recordings: records,
    };
  } catch (error) {
    console.error("Error generating privacy report:", error);
    throw error;
  }
};
// Example usage
module.exports = {
  calculatePrivacyScore,
  getPrivacyReport,
};
