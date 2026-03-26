const express = require("express");
const router = express.Router();

const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// GET all jobs
router.get("/", getJobs);

// CREATE job
router.post("/", createJob);

// UPDATE job
router.put("/:id", updateJob);

// DELETE job
router.delete("/:id", deleteJob);

module.exports = router;