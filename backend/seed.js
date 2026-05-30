require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./backend/models/User");
const SurveillanceRecord = require("./backend/models/SurveillanceRecord");
const Incident = require("./backend/models/Incident");

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🌱 Seeding database...");

    // Clear existing data
    await User.deleteMany({});
    await SurveillanceRecord.deleteMany({});
    await Incident.deleteMany({});

    // Create sample users
    const users = await User.insertMany([
      {
        name: "Ram Kumar",
        email: "ram@citizen.com",
        phone: "9876543210",
        password: "citizen123",
        role: "citizen",
        aadhar: "123456789012",
        privacyScore: 94,
      },
      {
        name: "Priya Singh",
        email: "priya@citizen.com",
        phone: "9876543211",
        password: "citizen123",
        role: "citizen",
        aadhar: "123456789013",
        privacyScore: 88,
      },
      {
        name: "Officer Rajesh",
        email: "rajesh@police.gov",
        phone: "9876543212",
        password: "officer123",
        role: "officer",
      },
      {
        name: "Supervisor Meera",
        email: "meera@police.gov",
        phone: "9876543213",
        password: "supervisor123",
        role: "supervisor",
      },
      {
        name: "Privacy Authority Vikram",
        email: "vikram@privacy.gov",
        phone: "9876543214",
        password: "privacy123",
        role: "privacy_authority",
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample surveillance records
    const records = await SurveillanceRecord.insertMany([
      {
        citizenId: users[0]._id,
        cameraId: "CAM_MALL_01",
        location: "City Mall - Main Entrance",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 1200,
        accessCount: 0,
        retentionDays: 30,
        isAnonymized: true,
      },
      {
        citizenId: users[0]._id,
        cameraId: "CAM_MALL_02",
        location: "City Mall - Food Court",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        duration: 900,
        accessCount: 1,
        retentionDays: 30,
        isAnonymized: true,
      },
      {
        citizenId: users[1]._id,
        cameraId: "CAM_METRO_01",
        location: "Metro Station - Platform A",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: 600,
        accessCount: 0,
        retentionDays: 30,
        isAnonymized: true,
      },
    ]);

    console.log(`✅ Created ${records.length} surveillance records`);

    // Create sample incident
    const incident = await Incident.create({
      caseNumber: "CASE-2026-00001",
      location: "City Mall - Main Entrance",
      incidentType: "theft",
      status: "created",
      priority: "high",
      description: "Suspected shoplifting incident",
      relatedCitizens: [users[0]._id],
      relatedRecords: [records[0]._id],
      createdBy: users[2]._id,
      assignedTo: users[3]._id,
    });

    console.log(`✅ Created incident: ${incident.caseNumber}`);

    console.log("\n📊 Seed Data Summary:");
    console.log(`   Citizens: 2 (Ram, Priya)`);
    console.log(`   Officers: 1 (Rajesh)`);
    console.log(`   Supervisors: 1 (Meera)`);
    console.log(`   Privacy Authority: 1 (Vikram)`);
    console.log(`   Surveillance Records: 3`);
    console.log(`   Incidents: 1`);

    console.log("\n✅ Seeding complete!\n");
    console.log("Demo Users:");
    console.log("  Citizen: ram@citizen.com / citizen123");
    console.log("  Officer: rajesh@police.gov / officer123");
    console.log("  Privacy Authority: vikram@privacy.gov / privacy123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
