import { Request, Response } from "express";
import { JobService } from "../service/jobService";

export async function createJob(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      deptId,
      minExperience,
      maxExperience,
      skillsRequired,
      employmentTypeId,
      educationRequired,
    } = req.body;

    const newJob = await JobService.createJob(
      title,
      description,
      Number(deptId),
      minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      skillsRequired,
      employmentTypeId ? Number(employmentTypeId) : undefined,
      educationRequired
    );

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Job" });
  }
}

export async function getAllJobs(req: Request, res: Response) {
  try {
    const jobs = await JobService.getAllJobs();
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve Jobs" });
  }
}

export async function deleteJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    await JobService.deleteJob(numericId);

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete Job" });
  }
}

export async function updateJob(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      deptId,
      minExperience,
      maxExperience,
      skillsRequired,
      employmentTypeId,
      educationRequired,
    } = req.body;

    const numericId = Number(id);

    const job = await JobService.updateJob(
      numericId,
      title,
      description,
      Number(deptId),
      minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      skillsRequired,
      employmentTypeId ? Number(employmentTypeId) : undefined,
      educationRequired
    );

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Job" });
  }
}

export async function generateJD(req: Request, res: Response) {
  try {
    const {
      title,
      skillsRequired,
      minExperience,
      maxExperience,
      employmentTypeId,
      educationRequired,
      description,
    } = req.body;

    const jd = await JobService.generateJD(
      title,
      skillsRequired,
      minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      employmentTypeId ? Number(employmentTypeId) : undefined,
      educationRequired,
      description
    );

    res.status(200).json({ jd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate JD" });
  }
}