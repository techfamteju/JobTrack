const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/Job");

const router = express.Router();
const allowedStatuses = ["Applied", "Interview", "Offer", "Rejected"];

function validateJobInput(body) {
  const errors = [];
  if (!body.company || !String(body.company).trim()) errors.push("Company name is required.");
  if (!body.title || !String(body.title).trim()) errors.push("Job title is required.");
  if (body.status && !allowedStatuses.includes(body.status)) errors.push("Invalid status.");
  if (body.jobUrl && !/^https?:\/\/\S+/i.test(body.jobUrl)) {
    errors.push("Job link must begin with http:// or https://.");
  }
  return errors;
}

// GET /api/jobs?status=Applied&search=developer
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const search = String(req.query.search).trim();
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch applications." });
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Application not found." });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch application." });
  }
});

// POST /api/jobs
router.post("/", async (req, res) => {
  const errors = validateJobInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(" ") });

  try {
    const job = await Job.create({
      company: req.body.company,
      title: req.body.title,
      location: req.body.location || "",
      status: req.body.status || "Applied",
      appliedDate: req.body.appliedDate || Date.now(),
      jobUrl: req.body.jobUrl || "",
      notes: req.body.notes || "",
      interviewDate: req.body.interviewDate || null
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not create application." });
  }
});

// PUT /api/jobs/:id
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid application ID." });
  }
  const errors = validateJobInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(" ") });

  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        company: req.body.company,
        title: req.body.title,
        location: req.body.location || "",
        status: req.body.status || "Applied",
        appliedDate: req.body.appliedDate || Date.now(),
        jobUrl: req.body.jobUrl || "",
        notes: req.body.notes || "",
        interviewDate: req.body.interviewDate || null
      },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Application not found." });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not update application." });
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid application ID." });
  }
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Application not found." });
    res.json({ message: "Application deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete application." });
  }
});

module.exports = router;
