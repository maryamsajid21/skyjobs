const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Job = sequelize.define("Job", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  requiredSkills: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  budgetMin: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  budgetMax: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  deadline: { type: DataTypes.DATEONLY, allowNull: false },
  status: {
    type: DataTypes.ENUM("open", "in_progress", "completed", "cancelled"),
    defaultValue: "open",
  },
  clientId: { type: DataTypes.INTEGER, allowNull: false },
  hiredFreelancerId: { type: DataTypes.INTEGER, allowNull: true },
  acceptedBidId: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

module.exports = Job;
