import { Request, Response } from "express";
import {
  createInterviewSchedule,
  getInterviewSchedule,
} from "../service/scheduleinterviewService";

export async function scheduleInterview(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);
  const { scheduledDate, scheduledTime, mode, recruiterEmail } = req.body;

  // Validate required fields
  if (!scheduledDate || !scheduledTime || !mode || !recruiterEmail) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!["online", "offline"].includes(mode)) {
    return res.status(400).json({ message: "Mode must be 'online' or 'offline'." });
  }

  try {
    const schedule = await createInterviewSchedule(
      applicationId,
      scheduledDate,
      scheduledTime,
      mode,
      recruiterEmail
    );

    return res.status(201).json({
      message: "Interview scheduled successfully.",
      data: schedule,
    });
  } catch (err: any) {
    console.error("scheduleInterview error:", err);
    return res
      .status(err?.status ?? 500)
      .json({ message: err?.message ?? "Internal server error." });
  }
}

// ── GET /schedule-interview/:applicationId ────────────────────────────────────
export async function fetchInterviewSchedule(req: Request, res: Response) {
  const applicationId = Number(req.params.applicationId);

  try {
    const schedule = await getInterviewSchedule(applicationId);
    return res.status(200).json({ data: schedule });
  } catch (err: any) {
    console.error("fetchInterviewSchedule error:", err);
    return res
      .status(err?.status ?? 500)
      .json({ message: err?.message ?? "Internal server error." });
  }
}