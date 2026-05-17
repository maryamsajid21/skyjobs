const { Review, Job, User } = require("../models");

const createReview = async (req, res) => {
  const { jobId, rating, comment } = req.body;
  try {
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.clientId !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
    if (job.status !== "completed") return res.status(400).json({ success: false, message: "Job must be completed to leave a review" });

    const existing = await Review.findOne({ where: { jobId } });
    if (existing) return res.status(400).json({ success: false, message: "Review already submitted for this job" });

    const review = await Review.create({ jobId, clientId: req.user.id, freelancerId: job.hiredFreelancerId, rating, comment });

    // Recalculate freelancer average rating
    const allReviews = await Review.findAll({ where: { freelancerId: job.hiredFreelancerId } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.update({ averageRating: avg.toFixed(2) }, { where: { id: job.hiredFreelancerId } });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReview };
