const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("client", "freelancer", "admin"), allowNull: false },
  bio: { type: DataTypes.TEXT, defaultValue: "" },
  skills: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  portfolioLinks: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  hourlyRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  averageRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  totalJobsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = User;
