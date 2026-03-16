import fs from "fs";
import mammoth from "mammoth";

const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

export const extractTextFromFile = async (filePath: string): Promise<string> => {
  if (filePath.endsWith(".pdf")) {
    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
      
      const loadingTask = pdfjsLib.getDocument({ 
        data,
        disableFontFace: true,
        useSystemFonts: true,
        isEvalSupported: false 
      });

      const pdf = await loadingTask.promise;
      let fullText = "";

      // Loop through all pages of the resume
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Joining items with a space preserves word separation
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
          
        fullText += pageText + "\n";
      }

      return fullText.trim();
    } catch (error: any) {
      console.error("PDF Parsing Error:", error.message);
      // This will catch the 'bad XRef entry' error from earlier
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  if (filePath.endsWith(".docx")) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      // Mammoth extracts raw text while preserving paragraph breaks
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value.trim(); // This is the clean string text
    } catch (error: any) {
      console.error("Docx parsing error:", error);
      throw new Error(`Failed to parse Word file: ${error.message}`);
    }
  }

  throw new Error("Unsupported file format");
};