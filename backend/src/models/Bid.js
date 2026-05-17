const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Bid = sequelize.define("Bid", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  freelancerId: { type: DataTypes.INTEGER, allowNull: false },
  proposedPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  coverLetter: { type: DataTypes.TEXT, allowNull: false },
  estimatedDeliveryDays: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected", "withdrawn"),
    defaultValue: "pending",
  },
}, { timestamps: true });

module.exports = Bid;
