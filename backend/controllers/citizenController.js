const SurveillanceRecord = require("../models/SurveillanceRecord");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const { getPrivacyReport, calculatePrivacyScore } = require("../utils/privacyUtils");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const privacyReport = await getPrivacyReport(userId);

    const recentRecordings = await SurveillanceRecord.find({ citizenId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const accessHistory = await AuditLog.find({
      targetType: "SurveillanceRecord",
      action: "data_access",
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadNotifications = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      privacyScore: privacyReport.privacyScore,
      totalRecordings: privacyReport.totalRecordings,
      locationsCaptured: privacyReport.locationsByLocation,
      recentRecordings,
      accessHistory,
      unreadNotifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard", error: error.message });
  }
};

exports.getMyRecordings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { location, startDate, endDate } = req.query;

    let query = { citizenId: userId };

    if (location) {
      query.location = location;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const recordings = await SurveillanceRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      count: recordings.length,
      recordings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recordings", error: error.message });
  }
};

exports.getAccessHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const accessLogs = await AuditLog.find({
      targetType: "SurveillanceRecord",
      action: "data_access",
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      accessLogs,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch access history", error: error.message });
  }
};

exports.getPrivacyScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const score = await calculatePrivacyScore(userId);

    res.json({
      privacyScore: score,
      scale: "0-100",
      description: "Higher score indicates better privacy protection",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch privacy score", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};
