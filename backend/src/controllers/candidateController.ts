import { Request, Response } from "express";
import { CandidateService } from "../service/candidateService";


export async function createCandidate(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      email,
      phone,
      loginId,
      skills,
      totalExperience,
      dateOfBirth,
      educationDetails,
      experienceDetails,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Resume required",
      });
    }

    const candidate =
      await CandidateService.createCandidate(
        name,
        email,
        phone,
        file.filename,
        loginId,
        skills,
        totalExperience ? Number(totalExperience) : undefined,
        dateOfBirth,
        educationDetails
          ? JSON.parse(educationDetails)
          : undefined,
        experienceDetails
          ? JSON.parse(experienceDetails)
          : undefined
      );

    return res.status(201).json(candidate);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create candidate",
    });
  }
}


export async function getCandidate(
  req: Request,
  res: Response
) {
  try {
    const loginId = Number(req.params.loginId);

    if (!loginId) {
      return res.status(400).json({
        message: "Invalid login id",
      });
    }

    const candidate =
      await CandidateService.getCandidateByLoginId(loginId);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    return res.json(candidate);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}


export async function getCandidateById(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid candidate id",
      });
    }

    const candidate =
      await CandidateService.getCandidateById(id);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    return res.json(candidate);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch candidate",
    });
  }
}

export async function updateCandidate(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const {
      name,
      email,
      phone,
      skills,
      totalExperience,
      dateOfBirth,
      educationDetails,
      experienceDetails,
    } = req.body;

    const file = req.file;

    const existing =
      await CandidateService.getCandidateById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    const resume = file
      ? file.filename
      : existing.resume;

    const updated =
      await CandidateService.updateCandidate(
        id,
        name,
        email,
        phone,
        resume,
        skills,
        totalExperience ? Number(totalExperience) : undefined,
        dateOfBirth,
        educationDetails
          ? JSON.parse(educationDetails)
          : undefined,
        experienceDetails
          ? JSON.parse(experienceDetails)
          : undefined
      );

    return res.json(updated);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update candidate",
    });
  }
}

export async function parseResume(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const parsed = await CandidateService.parseResumeToFields(file.filename);
    return res.json(parsed);
  } catch (error) {
    console.error("Parse resume error:", error);
    return res.status(500).json({ error: "Failed to parse resume" });
  }
}