import { Router } from "express";
import {
  scheduleInterview,
  fetchInterviewSchedule,
} from "../controllers/scheduleinterviewController";

const router = Router();

router.post("/schedule-interview/:applicationId", scheduleInterview);

router.get("/get-schedule-interview/:applicationId", fetchInterviewSchedule);

export default router;