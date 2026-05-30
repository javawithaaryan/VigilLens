const AuditLog = require("../models/AuditLog");

exports.logAction = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      if (req.user) {
        const log = new AuditLog({
          userId: req.user._id,
          action: req.auditAction || "unknown",
          targetType: req.auditTargetType || "System",
          targetId: req.auditTargetId,
          targetName: req.auditTargetName,
          reason: req.auditReason,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          status: res.statusCode < 400 ? "success" : "failed",
          details: req.auditDetails,
        });

        await log.save();
      }
    } catch (error) {
      console.error("Error logging action:", error);
    }
  });

  next();
};
