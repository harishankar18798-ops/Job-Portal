import { Request, Response } from "express";
import { JobService } from "../service/jobService";
 
export async function createJob(req: Request, res: Response) {
  try {
    const {
      title,
      roleOverview,
      deptId,
      minExperience,
      maxExperience,
      keyRequirements,
      coreRequirements,
      employmentTypeId,
    } = req.body;
 
    if (!title || !roleOverview || !deptId) {
      return res.status(400).json({
        message: "title, roleOverview and deptId are required",
      });
    }
 
    const job = await JobService.createJob(
      title,
      roleOverview,
      Number(deptId),
       minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      keyRequirements,
      coreRequirements,
      employmentTypeId ? Number(employmentTypeId) : undefined
    );
 
    return res.status(201).json(job);
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ message: "Failed to create job" });
  }
}
 
export async function getAllJobs(req: Request, res: Response) {
  try {
    const jobs = await JobService.getAllJobs();
    return res.json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
}
 
export async function deleteJob(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
 
    if (!id) {
      return res.status(400).json({ message: "Invalid job id" });
    }
 
    const deleted = await JobService.deleteJob(id);
 
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
 
    return res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({ message: "Failed to delete job" });
  }
}
 
export async function updateJob(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
 
    const {
      title,
      roleOverview,
      deptId,
      minExperience,
      maxExperience,
      keyRequirements,
      coreRequirements,
      employmentTypeId,
      status,
    } = req.body;
 
    if (!id || !title || !roleOverview || !deptId) {
      return res.status(400).json({
        message: "id, title, roleOverview and deptId are required",
      });
    }
 
    const updated = await JobService.updateJob(
      id,
      title,
      roleOverview,
      Number(deptId),
       minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      keyRequirements,
      coreRequirements,
      employmentTypeId ? Number(employmentTypeId) : undefined,
      status
    );
 
    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }
 
    return res.json(updated);
  } catch (error) {
    console.error("Update job error:", error);
    return res.status(500).json({ message: "Failed to update job" });
  }
}
 
export async function generateJD(req: Request, res: Response) {
  try {
    const {
      title,
      keyRequirements,
      minExperience,
      maxExperience,
      employmentTypeId,
      roleOverview,
      coreRequirements,
    } = req.body;
 
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
 
    const jd = await JobService.generateJD(
      title,
      keyRequirements,
       minExperience ? Number(minExperience) : undefined,
      maxExperience ? Number(maxExperience) : undefined,
      employmentTypeId ? Number(employmentTypeId) : undefined,
      roleOverview,
      coreRequirements
    );
 
    return res.status(200).json({ jd });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate JD" });
  }
}
 
export async function updateJobStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
 
    if (!id || !status) {
      return res.status(400).json({
        message: "id and status are required",
      });
    }
 
    if (!["Posted", "Draft", "Closed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }
 
    const updated = await JobService.updateJobStatus(id, status);
 
    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }
 
    return res.json(updated);
  } catch (error) {
    console.error("Update job status error:", error);
    return res.status(500).json({ message: "Failed to update job status" });
  }
}