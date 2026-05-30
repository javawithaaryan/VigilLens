const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    incidentType: {
      type: String,
      enum: ["theft", "fighting", "crowd_panic", "intrusion", "abandoned_object", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "under_investigation", "closed", "resolved"],
      default: "created",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    description: String,
    relatedCitizens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    relatedRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurveillanceRecord",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: [
      {
        officer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    identityRevealRequests: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: Date,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        citizenId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", IncidentSchema);
