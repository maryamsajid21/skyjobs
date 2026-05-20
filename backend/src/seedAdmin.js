// Run once to create the admin account: node src/seedAdmin.js
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL    = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";
const ADMIN_NAME     = "SkyJobs Admin";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    });

const User = sequelize.define("User", {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.ENUM("client", "freelancer", "admin"), allowNull: false },
  bio:      { type: DataTypes.TEXT, defaultValue: "" },
  skills:             { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  portfolioLinks:     { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  hourlyRate:         { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  averageRating:      { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  totalJobsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:           { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected.");
    await sequelize.sync({ alter: true });

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log("Admin already exists:", ADMIN_EMAIL);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: "admin" });

    console.log("Admin created!");
    console.log("  Email   :", ADMIN_EMAIL);
    console.log("  Password:", ADMIN_PASSWORD);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
