import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateApplicationEmail(
  candidateName: string,
  jobTitle: string,
  status: string,
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an HR assistant.

Write a professional email to candidate.

Candidate Name: ${candidateName}
Job Title: ${jobTitle}
Application Status: ${status}

Keep email short, polite and professional.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}