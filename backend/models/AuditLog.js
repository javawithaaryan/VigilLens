const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "data_access",
        "identity_reveal_request",
        "identity_reveal_approved",
        "identity_reveal_rejected",
        "incident_created",
        "incident_updated",
        "record_deleted",
        "user_login",
        "user_created",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["SurveillanceRecord", "Incident", "User", "System"],
      required: true,
    },
    targetId: mongoose.Schema.Types.ObjectId,
    targetName: String,
    reason: String,
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    details: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
