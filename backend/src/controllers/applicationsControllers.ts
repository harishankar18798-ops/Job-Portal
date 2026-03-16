import { Request, Response } from "express";
import { ApplicationService } from "../service/applicationsService";

export async function createApplication(req: Request, res: Response) {
  try {
    const { candidateId, jobId } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({ message: "candidateId and jobId required" });
    }

    const application = await ApplicationService.createApplication(
      Number(candidateId),
      Number(jobId)
    );

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create application" });
  }
}

export async function getApplication(req: Request, res: Response) {
  try {
    const applications = await ApplicationService.getAllApplications();
    return res.json(applications);
  } catch (error) {
    console.error("Get all applications error:", error);
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
}

export async function getApplicationByCandidateId(req: Request, res: Response) {
  try {
    const candidateId = Number(req.params.candidateId);

    if (!candidateId) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const applications = await ApplicationService.getApplicationByCandidateId(candidateId);
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Invalid id or status" });
    }

    const updated = await ApplicationService.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
}

export const getAIReport = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid application id" });
    }

    const report = await ApplicationService.generateAIReport(id);

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error("AI Report Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate AI report" });
  }
};