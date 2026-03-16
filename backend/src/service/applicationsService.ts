import { Application } from "../models/applications";
import { sendEmail } from "../utils/email";
//import { generateApplicationEmail } from "../utils/applicationEmail";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ApplicationWithAssociations = Application & { candidate?: any; job?: any };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class ApplicationService {

  static async createApplication(candidateId: number, jobId: number) {
    const application = await Application.create({ candidateId, jobId, status: "Applied" });

    const fullApp = await Application.findByPk(application.id, {
      include: [
        { association: "candidate", attributes: ["name", "email"] },
        { association: "job",       attributes: ["title"] },
      ],
    }) as ApplicationWithAssociations | null;

    if (fullApp?.candidate?.email && fullApp.job) {
      (async () => {
        try {
          await sendEmail(
            fullApp.candidate.email,
            `Application Received - ${fullApp.job.title}`,
            `Hi ${fullApp.candidate.name},\n\nThank you for applying to ${fullApp.job.title}.\n\nWe've received your application and will review it shortly.\n\nRegards,\nHiring Team`
          );
        } catch (err) { console.error("Application email failed:", err); }
      })();
    }
    return application;
  }

  static async getAllApplications() {
    return Application.findAll({
      include: [
        { association: "candidate", attributes: ["id", "name", "email"] },
        { association: "job",       attributes: ["id", "title"] },
      ],
      order: [["id", "DESC"]],
    });
  }

  static async getApplicationByCandidateId(candidateId: number) {
    return Application.findAll({
      where: { candidateId },
      include: [{ association: "job", attributes: ["id", "title"] }],
    });
  }

  // static async updateStatus(id: number, status: string) {
  //   const application = await Application.findByPk(id, {
  //     include: [
  //       { association: "candidate", attributes: ["name", "email"] },
  //       { association: "job",       attributes: ["title"] },
  //     ],
  //   }) as ApplicationWithAssociations | null;

  //   if (!application) return null;
  //   application.status = status;
  //   await application.save();

  //   if (application.candidate?.email) {
  //   (async () => {
  //     try {
  //       const emailText = await generateApplicationEmail(
  //         application.candidate.name,
  //         application.job!.title,
  //         status
  //       );
  //       await sendEmail(
  //         application.candidate.email,
  //         `Application Status Update - ${application.job!.title}`,
  //         emailText
  //       );
  //     } catch (err) {
  //       console.error("Status update email failed:", err);
  //     }
  //   })();
  // }
  //   return application;
  // }

  static async updateStatus(id: number, status: string) {
    const application = await Application.findByPk(id, {
      include: [
        { association: "candidate", attributes: ["name", "email"] },
        { association: "job",       attributes: ["title"] },
      ],
    }) as ApplicationWithAssociations | null;

    if (!application) return null;
    application.status = status;
    await application.save();

    if (application.candidate?.email) {
      (async () => {
        try {
          const { name } = application.candidate;
          const title = application.job!.title;

          const emailText = `Dear ${name},

We wanted to inform you that the status of your application for the position of "${title}" has been updated.

Current Status: ${status}

${status === "Shortlisted"
  ? "Congratulations! You have been shortlisted for the next stage of our hiring process. We will be in touch shortly with further details."
  : status === "Interview"
  ? "Great news! You have been selected for an interview. Our team will contact you soon to schedule a convenient time."
  : status === "Selected"
  ? "We are delighted to inform you that you have been selected for this position. Our HR team will reach out to you with the next steps."
  : status === "Rejected"
  ? "Thank you for your interest and the time you invested in applying. After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for future openings."
  : status === "Withdrawn"
  ? "We have received your withdrawal request. Your application for this position has been successfully withdrawn. We hope to see you apply for future opportunities that match your profile."
  : "Your application is currently under review. We will keep you updated on any further developments."
}

Thank you for your interest in joining our team.

Best regards,
The Recruitment Team`;

          await sendEmail(
            application.candidate.email,
            `${status === "Withdrawn" ? "Application Withdrawn" : "Application Status Update"} - ${title}`,
            emailText
          );
        } catch (err) {
          console.error("Status update email failed:", err);
        }
      })();
    }

    return application;
  }

  static async generateAIReport(applicationId: number) {
    const application = await Application.findByPk(applicationId, {
      include: [{ association: "candidate" }, { association: "job" }],
    }) as ApplicationWithAssociations | null;

    if (!application) throw new Error("Application not found");

    if (application.aiReport) return application.aiReport;

    const { candidate, job } = application;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`
You are an expert HR recruiter. Analyze candidate profile against job requirements.
Return strictly JSON (no markdown):
{ "matchScore": number, "remarks": string, "advantages": string, "disadvantages": string, "recommendation": string }

Candidate: Name=${candidate?.name}, Skills=${candidate?.skills}, Experience=${candidate?.totalExperience}yrs
Education: ${JSON.stringify(candidate?.educationDetails)}
Experience: ${JSON.stringify(candidate?.experienceDetails)}
Resume: ${candidate?.resumeText}

Job: Title=${job?.title}, Skills=${job?.skillsRequired}, Exp=${job?.minExperience}-${job?.maxExperience}yrs
Description: ${job?.description}
`);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(text);
      application.aiReport = parsed;
      await application.save();
      return parsed;
    } catch {
      return { raw: text };
    }
  }

}