const { Op } = require("sequelize");
const { Job, User, Bid, Review } = require("../models");

const createJob = async (req, res) => {
  const { title, description, category, requiredSkills, budgetMin, budgetMax, deadline } = req.body;
  try {
    const job = await Job.create({
      title, description, category, requiredSkills, budgetMin, budgetMax, deadline,
      clientId: req.user.id,
    });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobs = async (req, res) => {
  const { search, category, status = "open", minBudget, maxBudget, sort = "newest", page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (minBudget) where.budgetMin = { [Op.gte]: minBudget };
  if (maxBudget) where.budgetMax = { [Op.lte]: maxBudget };
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const order =
    sort === "budget_high" ? [["budgetMax", "DESC"]] :
    sort === "budget_low"  ? [["budgetMin", "ASC"]] :
    sort === "deadline"    ? [["deadline", "ASC"]] :
                             [["createdAt", "DESC"]];

  try {
    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: User, as: "client", attributes: ["id", "name", "averageRating"] }],
      order,
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

const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: User, as: "client", attributes: ["id", "name", "averageRating"] },
        {
          model: Bid, as: "bids",
          include: [{ model: User, as: "freelancer", attributes: ["id", "name", "averageRating", "skills", "totalJobsCompleted"] }],
        },
        { model: Review, as: "review", attributes: ["id", "rating", "comment", "createdAt"] },
      ],
    });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

    const bidCount = await Bid.count({ where: { jobId: job.id } });
    if (bidCount > 0) return res.status(400).json({ success: false, message: "Cannot edit a job that already has bids" });

    await job.update(req.body);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

    const bidCount = await Bid.count({ where: { jobId: job.id } });
    if (bidCount > 0) return res.status(400).json({ success: false, message: "Cannot delete a job that already has bids" });

    await job.destroy();
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { clientId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    const jobsWithBidCount = await Promise.all(
      jobs.map(async (job) => {
        const bidCount = await Bid.count({ where: { jobId: job.id } });
        return { ...job.toJSON(), bidCount };
      })
    );
    res.json({ success: true, data: jobsWithBidCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const completeJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
    if (job.status !== "in_progress") return res.status(400).json({ success: false, message: "Job must be in progress to complete" });

    await job.update({ status: "completed" });
    if (job.hiredFreelancerId) {
      const freelancer = await User.findByPk(job.hiredFreelancerId);
      if (freelancer) await freelancer.increment("totalJobsCompleted");
    }
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs, completeJob };
