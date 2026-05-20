const { User, Review, Job, Bid } = require("../models");

const getFreelancerProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user || user.role !== "freelancer")
      return res.status(404).json({ success: false, message: "Freelancer not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { freelancerId: req.params.id },
      include: [{ model: Job, as: "job", attributes: ["id", "title"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNotifications = async (req, res) => {
  const { Notification } = require("../models");
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markNotificationsRead = async (req, res) => {
  const { Notification } = require("../models");
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClientProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user || user.role !== "client")
      return res.status(404).json({ success: false, message: "Client not found" });

    const jobs = await Job.findAll({
      where: { clientId: req.params.id },
      order: [["createdAt", "DESC"]],
    });
    const jobsWithBidCount = await Promise.all(
      jobs.map(async (job) => {
        const bidCount = await Bid.count({ where: { jobId: job.id } });
        return { ...job.toJSON(), bidCount };
      })
    );

    res.json({ success: true, data: { ...user.toJSON(), jobs: jobsWithBidCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFreelancerProfile, getFreelancerReviews, getClientProfile, getNotifications, markNotificationsRead };
