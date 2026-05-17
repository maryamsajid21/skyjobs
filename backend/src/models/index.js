const User = require("./User");
const Job = require("./Job");
const Bid = require("./Bid");
const Review = require("./Review");
const Notification = require("./Notification");

// User → Jobs (client posts many jobs)
User.hasMany(Job, { foreignKey: "clientId", as: "postedJobs" });
Job.belongsTo(User, { foreignKey: "clientId", as: "client" });

// User → Bids (freelancer submits many bids)
User.hasMany(Bid, { foreignKey: "freelancerId", as: "bids" });
Bid.belongsTo(User, { foreignKey: "freelancerId", as: "freelancer" });

// Job → Bids
Job.hasMany(Bid, { foreignKey: "jobId", as: "bids" });
Bid.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// Job → Review (one-to-one)
Job.hasOne(Review, { foreignKey: "jobId", as: "review" });
Review.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// User → Notifications
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { User, Job, Bid, Review, Notification };
