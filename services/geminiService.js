import { GoogleGenAI, Type } from "@google/genai";

let aiInstance = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : "";
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

export async function generateTutorial(topic) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a cryptography tutorial about ${topic}. Return as JSON with title, tutorial, task, correctAnswer, explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tutorial: { type: Type.STRING },
            task: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["title", "tutorial", "task", "correctAnswer", "explanation"],
        },
      },
    });
    return { ...JSON.parse(response.text), id: Math.random().toString(36), topic };
  } catch (e) {
    return {
      id: 'fallback',
      title: 'Encryption 101',
      tutorial: 'Encryption secures data by scrambling it.',
      task: 'What is the goal of encryption?',
      correctAnswer: 'security',
      explanation: 'Encryption ensures confidentiality.',
      topic
    };
  }
}