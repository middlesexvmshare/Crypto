import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle, CryptoTopic } from "../types.ts";

/**
 * We use a getter for the AI instance to ensure it always uses the latest state 
 * of process.env and doesn't crash during early module evaluation if process is being shimmed.
 */
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : "";
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

/**
 * Generates an educational cryptography tutorial and puzzle using Gemini.
 */
export async function generateTutorial(topic: CryptoTopic): Promise<Puzzle> {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : "";
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Falling back to local puzzle generation.");
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
    const ai = getAI();
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
    // Return a fallback puzzle so the game remains playable offline or without a key
    return {
      id: 'fallback-' + Math.random().toString(36).substr(2, 4),
      topic,
      title: `${topic} Module`,
      tutorial: `Learn about ${topic} to enhance your cryptographic skills. Cryptography is the practice and study of techniques for secure communication in the presence of third parties.`,
      task: `What is the primary goal of ${topic}?`,
      correctAnswer: "security",
      explanation: "Security and data protection are the fundamental objectives of all cryptographic methods."
    };
  }
}