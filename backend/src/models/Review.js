const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  clientId: { type: DataTypes.INTEGER, allowNull: false },
  freelancerId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, defaultValue: "" },
}, { timestamps: true, updatedAt: false });

module.exports = Review;
