
import { GoogleGenAI, Type } from "@google/genai";
import { Puzzle, CryptoTopic } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an educational cryptography tutorial and puzzle.
 * Uses gemini-3-pro-preview for high-quality content generation in STEM subjects.
 */
export async function generateTutorial(topic: CryptoTopic): Promise<Puzzle> {
  const prompt = `Create a short, engaging cryptography tutorial about "${topic}". 
    Format: 
    1. Title
    2. Tutorial: 3-4 sentences explaining the core concept.
    3. Task: A very simple question or challenge based on the tutorial.
    4. Correct Answer: A single word or short phrase.
    5. Explanation: Why that answer is correct.
    Keep it beginner friendly but educational.`;

  // Select gemini-3-pro-preview for complex reasoning and STEM tasks.
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

  // Correctly access the .text property from the GenerateContentResponse object.
  const jsonStr = response.text || '{}';
  const data = JSON.parse(jsonStr);

  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    topic
  };
}
