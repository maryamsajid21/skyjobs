const { Op } = require("sequelize");
const { User, Job, Bid } = require("../models");

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalBids, openJobs, activeJobs, completedJobs] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: "admin" } } }),
      Job.count(),
      Bid.count(),
      Job.count({ where: { status: "open" } }),
      Job.count({ where: { status: "in_progress" } }),
      Job.count({ where: { status: "completed" } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalJobs, totalBids, openJobs, activeJobs, completedJobs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  const { search, role, page = 1 } = req.query;
  const limit = 15;
  const offset = (page - 1) * limit;
  const where = { role: { [Op.ne]: "admin" } };
  if (role) where.role = role;
  if (search) where[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { email: { [Op.iLike]: `%${search}%` } },
  ];

  try {
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    res.json({ success: true, data: { users: rows, total: count, page: +page, pages: Math.ceil(count / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    await User.update({ isActive: false }, { where: { id: req.params.id } });
    res.json({ success: true, message: "User suspended" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const activateUser = async (req, res) => {
  try {
    await User.update({ isActive: true }, { where: { id: req.params.id } });
    res.json({ success: true, message: "User activated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllJobs = async (req, res) => {
  const { search, status, page = 1 } = req.query;
  const limit = 15;
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (search) where.title = { [Op.iLike]: `%${search}%` };

  try {
    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: User, as: "client", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    const jobsWithBidCount = await Promise.all(
      rows.map(async (job) => {
        const bidCount = await Bid.count({ where: { jobId: job.id } });
        return { ...job.toJSON(), bidCount };
      })
    );
    res.json({ success: true, data: { jobs: jobsWithBidCount, total: count, page: +page, pages: Math.ceil(count / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    await Job.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Job removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getAllUsers, suspendUser, activateUser, deleteUser, getAllJobs, deleteJob };
