
import { GoogleGenAI, Type } from "@google/genai";

// Corrected: Initializing with a named parameter and direct environment variable access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPlanEnhancements = async (title: string, description: string) => {
  // Corrected: Removed manual API key check as its availability is assumed per guidelines
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I am planning an activity: "${title}". Description: "${description}". Give me 3 creative catchphrases or icebreakers to include in my post to attract more companions. Keep them short and friendly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // Corrected: Use the .text property directly and handle potential empty responses
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Let's make some memories together!", "Join in for a great time!", "The more the merrier!"];
  }
};
