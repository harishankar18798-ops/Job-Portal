import { Job } from "../models/job";
import { Dept } from "../models/dept";
import { EmploymentType } from "../models/employmentType";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class JobService {

  static async createJob(
    title: string,
    description: string,
    deptId: number,
    minExperience?: number,
    maxExperience?: number,
    skillsRequired?: string,
    employmentTypeId?: number,
    educationRequired?: string
  ) {
    return await Job.create({
      title,
      description,
      deptId,
      minExperience,
      maxExperience,
      skillsRequired,
      employmentTypeId,
      educationRequired,
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
    description: string,
    deptId: number,
    minExperience?: number,
    maxExperience?: number,
    skillsRequired?: string,
    employmentTypeId?: number,
    educationRequired?: string
  ) {
    const job = await Job.findByPk(id);

    if (!job) return null;

    job.title = title;
    job.description = description;
    job.deptId = deptId;

    job.minExperience = minExperience ?? job.minExperience;
    job.maxExperience = maxExperience ?? job.maxExperience;
    job.skillsRequired = skillsRequired ?? job.skillsRequired;
    job.employmentTypeId = employmentTypeId ?? (job as any).employmentTypeId;
    job.educationRequired = educationRequired ?? job.educationRequired;

    await job.save();

    return job;
  }

  static async generateJD(
    title: string,
    skillsRequired?: string,
    minExperience?: number,
    maxExperience?: number,
    employmentTypeId?: number,
    educationRequired?: string,
    description?: string
  ) {
    // Resolve employment type name if an id is provided
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
  Skills: ${skillsRequired || "Not specified"}
  Experience: ${minExperience || 0} - ${maxExperience || 0} years
  Employment Type: ${employmentTypeName}
  Education: ${educationRequired || "Not specified"}

  User Notes:
  ${description || "None"}

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
}