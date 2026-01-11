
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMaintenanceRequest = async (issueDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this property maintenance request: "${issueDescription}". 
      Provide a priority level (LOW, MEDIUM, HIGH, EMERGENCY) and a brief technical summary of potential causes and recommended first steps for the repair person.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              description: "Priority level: LOW, MEDIUM, HIGH, EMERGENCY",
            },
            assessment: {
              type: Type.STRING,
              description: "Technical assessment and recommended steps.",
            },
          },
          required: ["priority", "assessment"]
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      priority: "MEDIUM",
      assessment: "Manual assessment required due to AI processing error.",
    };
  }
};

export const summarizeAgreement = async (agreementDetails: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this property lease agreement key terms in bullet points: ${agreementDetails}`,
    });
    return response.text;
  } catch (error) {
    return "Error generating summary.";
  }
};
