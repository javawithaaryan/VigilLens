const mongoose = require("mongoose");

const SurveillanceRecordSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cameraId: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
    accessCount: {
      type: Number,
      default: 0,
    },
    retentionDays: {
      type: Number,
      default: 30,
    },
    deleteDate: Date,
    isAnonymized: {
      type: Boolean,
      default: true,
    },
    hasIncident: {
      type: Boolean,
      default: false,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
    },
  },
  { timestamps: true }
);

// Calculate delete date
SurveillanceRecordSchema.pre("save", function (next) {
  if (!this.deleteDate) {
    const deleteDate = new Date(this.timestamp);
    deleteDate.setDate(deleteDate.getDate() + this.retentionDays);
    this.deleteDate = deleteDate;
  }
  next();
});

module.exports = mongoose.model("SurveillanceRecord", SurveillanceRecordSchema);
