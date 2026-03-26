import { google } from "googleapis";
import { InterviewSchedule } from "../models/interviewschedule";
import { Application } from "../models/applications";
import { Candidate } from "../models/candidate";
import { Job } from "../models/job";
import { sendEmail } from "../utils/email";

// ── Google OAuth2 auth ────────────────────────────────────────────────────────
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// ── Create Google Meet link ───────────────────────────────────────────────────
async function createMeetLink(
  date: string,
  time: string,
  summary: string,
  candidateEmail: string,
  recruiterEmail: string
): Promise<string> {
  const startDateTime = new Date(`${date}T${time}:00`).toISOString();
  const endDateTime = new Date(
    new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000
  ).toISOString();

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
      end:   { dateTime: endDateTime,   timeZone: "Asia/Kolkata" },
      attendees: [
        { email: candidateEmail },
        { email: recruiterEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
    sendUpdates: "all",
  });

  const hangoutLink =
    event.data.hangoutLink ??
    event.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video"
    )?.uri ??
    null;

  console.log("Meet link:", hangoutLink);

  if (!hangoutLink) {
    throw new Error("Meet link not returned by Google API.");
  }

  return hangoutLink;
}

// ── Build email body ──────────────────────────────────────────────────────────
function buildEmailBody(params: {
  recipientName: string;
  candidateName: string;
  jobTitle:      string;
  date:          string;
  time:          string;
  mode:          string;
  meetLink?: string | null;
}): string {
  const modeSection =
    params.mode === "online"
      ? `Mode      : Online (Google Meet)\nMeet Link : ${params.meetLink}`
      : `Mode      : In-Person (Offline)`;

  return `
Hi ${params.recipientName},

Your interview for the position of "${params.jobTitle}" has been scheduled.

Candidate : ${params.candidateName}
Date      : ${params.date}
Time      : ${params.time}
${modeSection}

Please be on time. If you have any questions, feel free to reach out.

Best regards,
HR Team
  `.trim();
}

// ── Create / Reschedule ───────────────────────────────────────────────────────
export async function createInterviewSchedule(
  applicationId: number,
  scheduledDate: string,
  scheduledTime: string,
  mode: "online" | "offline",
  recruiterEmail: string
) {
  const chosenDate = new Date(`${scheduledDate}T${scheduledTime}:00`);
  if (chosenDate < new Date()) {
    throw { status: 400, message: "Scheduled date/time cannot be in the past." };
  }

  const application = await Application.findByPk(applicationId, {
    include: [
      { model: Candidate, as: "candidate" },
      { model: Job,       as: "job" },
    ],
  });

  if (!application) {
    throw { status: 404, message: "Application not found." };
  }

  const candidate = (application as any).candidate as Candidate;
  const job       = (application as any).job       as Job;

  let meetLink: string | null = null;
  if (mode === "online") {
    try {
      meetLink = await createMeetLink(
        scheduledDate,
        scheduledTime,
        `Interview: ${candidate.name} — ${job.title}`,
        candidate.email,   // ← added
        recruiterEmail     // ← added
      );
    } catch (err: any) {
      console.error("Google Meet creation failed:", err?.message ?? err);
      throw { status: 500, message: "Failed to create Google Meet link." };
    }
  }

  const existingSchedule = await InterviewSchedule.findOne({
    where: { applicationId },
  });

  let schedule;
  if (existingSchedule) {
    await existingSchedule.update({
      scheduledDate,
      scheduledTime,
      mode,
      meetLink,
      recruiterEmail,
      status: "scheduled",
    });
    schedule = existingSchedule;
  } else {
    schedule = await InterviewSchedule.create({
      applicationId,
      scheduledDate,
      scheduledTime,
      mode,
      meetLink,
      recruiterEmail,
    });
  }

  await Application.update(
    { status: "Interview" },
    { where: { id: applicationId } }
  );

  sendEmail(
    candidate.email,
    `Interview Scheduled — ${job.title}`,
    buildEmailBody({
      recipientName: candidate.name,
      candidateName: candidate.name,
      jobTitle:      job.title,
      date:          scheduledDate,
      time:          scheduledTime,
      mode,
      meetLink,
    })
  ).catch(err => console.error("Candidate email failed:", err));

  sendEmail(
    recruiterEmail,
    `Interview Scheduled — ${candidate.name} for ${job.title}`,
    buildEmailBody({
      recipientName: "Recruiter",
      candidateName: candidate.name,
      jobTitle:      job.title,
      date:          scheduledDate,
      time:          scheduledTime,
      mode,
      meetLink,
    })
  ).catch(err => console.error("Recruiter email failed:", err));

  return schedule;
}

// ── Get schedule by applicationId ─────────────────────────────────────────────
export async function getInterviewSchedule(applicationId: number) {
  const schedule = await InterviewSchedule.findOne({
    where: { applicationId },
  });

  if (!schedule) {
    throw { status: 404, message: "No schedule found." };
  }

  return schedule;
}