import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle, CryptoTopic } from "../types.ts";

// Initialize the API client. 
// We use a fallback empty string for the API key to prevent the constructor from throwing immediately if the key is missing.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Generates an educational cryptography tutorial and puzzle using Gemini.
 */
export async function generateTutorial(topic: CryptoTopic): Promise<Puzzle> {
  // If key is missing, we log a helpful message but the app stays functional (though puzzles won't load)
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. Tutorials cannot be generated.");
  }

  const prompt = `Create a short, engaging cryptography tutorial about "${topic}". 
    Format: 
    1. Title
    2. Tutorial: 3-4 sentences explaining the core concept.
    3. Task: A very simple question or challenge based on the tutorial.
    4. Correct Answer: A single word or short phrase.
    5. Explanation: Why that answer is correct.
    Keep it beginner friendly but educational.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
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

    const jsonStr = response.text || '{}';
    const data = JSON.parse(jsonStr);

    return {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      topic
    };
  } catch (error) {
    console.error("Error generating tutorial:", error);
    // Return a fallback puzzle so the game doesn't break
    return {
      id: 'fallback',
      topic,
      title: `${topic} Module`,
      tutorial: `Learn about ${topic} to enhance your cryptographic skills.`,
      task: `What is the goal of ${topic}?`,
      correctAnswer: "security",
      explanation: "Security is the primary goal of all cryptographic systems."
    };
  }
}