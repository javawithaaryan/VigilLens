const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["footage_accessed", "investigation_started", "identity_reveal_requested", "identity_reveal_approved"],
      required: true,
    },
    title: String,
    message: String,
    relatedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveillanceRecord",
    },
    relatedIncidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
