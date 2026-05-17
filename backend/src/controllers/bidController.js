const { Op } = require("sequelize");
const { Bid, Job, User, Notification } = require("../models");

const submitBid = async (req, res) => {
  const { jobId, proposedPrice, coverLetter, estimatedDeliveryDays } = req.body;
  try {
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.status !== "open") return res.status(400).json({ success: false, message: "Job is not open for bids" });
    if (job.clientId === req.user.id) return res.status(400).json({ success: false, message: "Cannot bid on your own job" });

    const existing = await Bid.findOne({ where: { jobId, freelancerId: req.user.id } });
    if (existing) return res.status(400).json({ success: false, message: "You already submitted a bid for this job" });

    const bid = await Bid.create({ jobId, freelancerId: req.user.id, proposedPrice, coverLetter, estimatedDeliveryDays });

    await Notification.create({
      userId: job.clientId,
      message: `New bid received on your job: ${job.title}`,
      type: "new_bid",
      relatedJobId: job.id,
    });

    res.status(201).json({ success: true, data: bid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBidsForJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

    const bids = await Bid.findAll({
      where: { jobId: req.params.jobId },
      include: [{ model: User, as: "freelancer", attributes: ["id", "name", "averageRating", "skills", "totalJobsCompleted"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { freelancerId: req.user.id },
      include: [{ model: Job, as: "job", include: [{ model: User, as: "client", attributes: ["id", "name"] }] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });
    if (bid.freelancerId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
    if (bid.status !== "pending") return res.status(400).json({ success: false, message: "Can only edit pending bids" });

    await bid.update(req.body);
    res.json({ success: true, data: bid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });
    if (bid.freelancerId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
    if (bid.status !== "pending") return res.status(400).json({ success: false, message: "Can only withdraw pending bids" });

    await bid.update({ status: "withdrawn" });
    res.json({ success: true, message: "Bid withdrawn" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });

    const job = await Job.findByPk(bid.jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
    if (job.status !== "open") return res.status(400).json({ success: false, message: "Job is no longer open" });

    // Accept this bid, reject all others
    await bid.update({ status: "accepted" });
    await Bid.update({ status: "rejected" }, { where: { jobId: job.id, id: { [Op.ne]: bid.id } } });
    await job.update({ status: "in_progress", hiredFreelancerId: bid.freelancerId, acceptedBidId: bid.id });

    // Notify the freelancer
    await Notification.create({
      userId: bid.freelancerId,
      message: `Your bid was accepted for: ${job.title}`,
      type: "bid_accepted",
      relatedJobId: job.id,
    });

    // Notify all rejected freelancers
    const rejectedBids = await Bid.findAll({ where: { jobId: job.id, status: "rejected" } });
    await Promise.all(
      rejectedBids.map((b) =>
        Notification.create({
          userId: b.freelancerId,
          message: `Your bid was not selected for: ${job.title}`,
          type: "bid_rejected",
          relatedJobId: job.id,
        })
      )
    );

    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitBid, getBidsForJob, getMyBids, updateBid, withdrawBid, acceptBid };
