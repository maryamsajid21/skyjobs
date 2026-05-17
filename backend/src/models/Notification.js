const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM("bid_accepted", "bid_rejected", "job_completed", "new_bid"),
    allowNull: false,
  },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  relatedJobId: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true, updatedAt: false });

module.exports = Notification;
