import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-3-flash-preview";
    
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant.",
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content from Gemini." });
  }
}
