import { Candidate } from "../models/candidate";
import path from "path";
import { extractTextFromFile } from "../utils/resumeParser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function parseResumeText(resume: string): Promise<string> {

  let resumeText = "";

  if (!resume) return resumeText;

  try {
    const filePath = path.join(process.cwd(), "uploads", resume);
    resumeText = (await extractTextFromFile(filePath)).trim();
  } catch (err) {
    console.error("Resume parse error:", err);
  }

  return resumeText;
}

export class CandidateService {

  static async createCandidate(
    name: string,
    email: string,
    phone: string,
    resume: string,
    loginId?: string,
    skills?: string,
    totalExperience?: number,
    dateOfBirth?: string,
    educationDetails?: any,
    experienceDetails?: any
  ) {

    const loginIdNumber = loginId ? Number(loginId) : null;

    // Parse resume before saving candidate
    const resumeText = await parseResumeText(resume);

    return await Candidate.create({
      name,
      email,
      phone,
      resume,
      resumeText,
      loginId: loginIdNumber,
      skills,
      totalExperience,
      dateOfBirth: dateOfBirth
        ? new Date(dateOfBirth)
        : undefined,
      educationDetails,
      experienceDetails,
    });
  }

  static async getCandidateByLoginId(loginId: number) {
    return await Candidate.findOne({
      where: { loginId },
    });
  }

  static async getCandidateById(id: number) {
    return await Candidate.findByPk(id);
  }

  static async updateCandidate(
    id: number,
    name: string,
    email: string,
    phone: string,
    resume: string,
    skills?: string,
    totalExperience?: number,
    dateOfBirth?: string,
    educationDetails?: any,
    experienceDetails?: any
  ) {

    const candidate = await Candidate.findByPk(id);
    if (!candidate) return null;

    let resumeText = candidate.resumeText;

    if (resume && resume !== candidate.resume) {
      const oldPath = path.join(process.cwd(), "uploads", candidate.resume);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      resumeText = await parseResumeText(resume);

      candidate.resume = resume;
      candidate.resumeText = resumeText;
    }

    candidate.name = name;
    candidate.email = email;
    candidate.phone = phone;
    // candidate.resume = resume;
    // candidate.resumeText = resumeText;

    candidate.skills = skills ?? candidate.skills;
    candidate.totalExperience =
      totalExperience ?? candidate.totalExperience;

    candidate.dateOfBirth =
      dateOfBirth
        ? new Date(dateOfBirth)
        : candidate.dateOfBirth;

    candidate.educationDetails =
      educationDetails ?? candidate.educationDetails;

    candidate.experienceDetails =
      experienceDetails ?? candidate.experienceDetails;

    await candidate.save();

    return candidate;
  }

  static async parseResumeToFields(filename: string) {
  const filePath = path.join(process.cwd(), "uploads", filename);
  const resumeText = await extractTextFromFile(filePath);

  fs.unlinkSync(filePath);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(`Extract fields from this resume and return ONLY valid JSON, no explanation, no markdown:
    {
      "name": "",
      "email": "",
      "phone": "",
      "skills": "comma separated skills",
      "totalExperience": 0,
      "dateOfBirth": "YYYY-MM-DD or empty string",
      "educationDetails": [{ "degree": "", "institution": "", "cgpa": "", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isCurrent": false }],
      "experienceDetails": [{ "company": "", "role": "", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isCurrent": false }]
    }
    Resume: ${resumeText}`);

  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
}