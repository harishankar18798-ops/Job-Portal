import { Job } from "../models/job";
import { Dept } from "../models/dept";
import { EmploymentType } from "../models/employmentType";
import { GoogleGenerativeAI } from "@google/generative-ai";
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 
export class JobService {
 
  static async createJob(
    title: string,
    roleOverview: string,
    deptId: number,
   minExperience?: number,
    maxExperience?: number,
    keyRequirements?: string,
    coreRequirements?: string,
    employmentTypeId?: number
  ) {
    return await Job.create({
      title,
      roleOverview,
      deptId,
      minExperience,
      maxExperience,
      keyRequirements,
      coreRequirements,
      employmentTypeId,
    });
  }
 
  static async getAllJobs() {
    return await Job.findAll({
      include: [
        {
          model: Dept,
          as: "dept",
          attributes: ["id", "name"],
        },
        {
          model: EmploymentType,
          as: "employmentType",
          attributes: ["id", "name"],
        },
      ],
    });
  }
 
  static async deleteJob(id: number) {
    return await Job.destroy({
      where: { id },
    });
  }
 
  static async updateJob(
    id: number,
    title: string,
    roleOverview: string,
    deptId: number,
    minExperience?: number,
    maxExperience?: number,
    keyRequirements?: string,
    coreRequirements?: string,
    employmentTypeId?: number,
    status?: "Posted" | "Draft" | "Closed"
  ) {
    const job = await Job.findByPk(id);
 
    if (!job) return null;
 
    job.title = title;
    job.roleOverview = roleOverview;
    job.deptId = deptId;
 
    job.minExperience = minExperience ?? job.minExperience;
    job.maxExperience = maxExperience ?? job.maxExperience;
    job.keyRequirements = keyRequirements ?? job.keyRequirements;
    job.coreRequirements = coreRequirements ?? job.coreRequirements;
    job.employmentTypeId =
      employmentTypeId ?? job.employmentTypeId;
 
    job.status = status ?? job.status;
 
    await job.save();
 
    return job;
  }
 
  static async generateJD(
    title: string,
    keyRequirements?: string,
    minExperience?: number,
    maxExperience?: number,
    employmentTypeId?: number,
    roleOverview?: string,
    coreRequirements?: string
  ) {
    let employmentTypeName = "Not specified";
 
    if (employmentTypeId) {
      const et = await EmploymentType.findByPk(employmentTypeId);
      if (et) employmentTypeName = (et as any).name || "Not specified";
    }
 
    const prompt = `
You are an HR expert.
 
Create a professional Job Description.
 
Job Details:
Title: ${title}
 Experience: ${minExperience || 0} - ${maxExperience || 0} years
Employment Type: ${employmentTypeName}
Key Requirements: ${keyRequirements || "Not specified"}
Core Requirements: ${coreRequirements || "Not specified"}
 
User Notes:
${roleOverview || "None"}
 
Instructions:
- If user notes exist, expand them into a full job description
- If empty, create from scratch
- Include:
  1. Role Overview
  2. Responsibilities
  3. Requirements
  4. Skills
  5. Benefits
`;
 
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
 
    const result = await model.generateContent(prompt);
 
    return result.response.text();
  }
 
  static async updateJobStatus(
  id: number,
  status: "Posted" | "Draft" | "Closed"
) {
  const job = await Job.findByPk(id);
 
  if (!job) return null;
const wasPosted = job.status === "Posted";
  job.status = status;
   if (!wasPosted && status === "Posted") {
    job.publishedAt = new Date();
  }
  await job.save();
 
  return job;
}
}