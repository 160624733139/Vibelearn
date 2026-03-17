import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface RoadmapStep {
  title: string;
  description: string;
  resources: { title: string; url: string; type: 'video' | 'article' | 'documentation' }[];
  estimatedTime: string;
}

export interface Roadmap {
  skill: string;
  level: string;
  summary: string;
  steps: RoadmapStep[];
}

export async function generateRoadmap(skill: string, level: string = 'beginner'): Promise<Roadmap> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed learning roadmap for mastering the skill: "${skill}" at a ${level} level. 
    Include 5-7 logical steps. For each step, provide a title, a brief description, 2-3 high-quality resource suggestions (use real-sounding titles, but you can use placeholder-style URLs if unsure, though real ones are better), and an estimated time to complete that step.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          level: { type: Type.STRING },
          summary: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['video', 'article', 'documentation'] }
                    },
                    required: ['title', 'url', 'type']
                  }
                },
                estimatedTime: { type: Type.STRING }
              },
              required: ['title', 'description', 'resources', 'estimatedTime']
            }
          }
        },
        required: ['skill', 'level', 'summary', 'steps']
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as Roadmap;
  } catch (e) {
    console.error("Failed to parse roadmap JSON", e);
    throw new Error("Failed to generate a valid roadmap. Please try again.");
  }
}

export async function generatePracticeTask(skill: string, stepTitle: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is learning "${skill}" and is currently on the step: "${stepTitle}". 
    Generate a specific, actionable practice task or mini-project they can do right now to reinforce what they've learned in this step. 
    Keep it concise (under 100 words) and very practical.`,
  });

  return response.text || "Try building a small project that incorporates the concepts from this step.";
}
