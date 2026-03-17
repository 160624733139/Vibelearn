import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DomainSuggestion {
  domain: string;
  description: string;
  skillsNeeded: string[];
  courses: { title: string; provider: string; url: string }[];
  companies: string[];
  marketStanding: string;
  demandPercentage: number;
}

export interface SkillGap {
  domain: string;
  lackingSkills: string[];
  roadmap: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export async function getDomainSuggestions(skills: string, interests: string): Promise<DomainSuggestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 career domains for someone with skills: "${skills}" and interests: "${interests}". 
    For each domain, provide:
    1. Domain name
    2. Brief description
    3. Skills needed
    4. 2-3 course suggestions (title, provider)
    5. Top hiring companies
    6. Market standing (e.g., "High Growth", "Stable", "Emerging")
    7. Demand percentage (0-100) for this role globally.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            domain: { type: Type.STRING },
            description: { type: Type.STRING },
            skillsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  provider: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "provider"]
              }
            },
            companies: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketStanding: { type: Type.STRING },
            demandPercentage: { type: Type.NUMBER }
          },
          required: ["domain", "description", "skillsNeeded", "courses", "companies", "marketStanding", "demandPercentage"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function getSkillGapAnalysis(currentSkills: string, targetDomains: string[]): Promise<SkillGap[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the skill gap for a user with skills: "${currentSkills}" who wants to enter these domains: ${targetDomains.join(", ")}.
    For each domain, list:
    1. Lacking skills (specific technical or soft skills)
    2. A 3-step roadmap to bridge the gap.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            domain: { type: Type.STRING },
            lackingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["domain", "lackingSkills", "roadmap"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export async function generateCourseModules(courseName: string): Promise<CourseModule[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a structured learning path for a course titled "${courseName}". 
    Return an array of 5 modules. Each module should have:
    - id: a unique string
    - title: name of the module
    - content: a detailed reading material (at least 200 words) for the module.
    - completed: false
    Format as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            completed: { type: Type.BOOLEAN },
          },
          required: ["id", "title", "content", "completed"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function generateQuiz(topic: string): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 5-question multiple choice quiz about "${topic}". 
    Each question should have 4 options and 1 correct answer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export interface FreeCourse {
  title: string;
  provider: string;
  url: string;
  description: string;
}

export async function getFreeCourseSuggestions(skills: string, interests: string): Promise<FreeCourse[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 5 FREE certification courses from platforms like Kaggle, Internshala, Coursera, etc., for someone with skills: "${skills}" and interests: "${interests}". 
    Focus on high-quality, free resources.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            provider: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "provider", "url", "description"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export interface GoalRoadmap {
  goal: string;
  difficulty: string;
  steps: { 
    title: string; 
    description: string; 
    resources: { title: string; url: string; type: string }[];
    modules: { title: string; content: string; completed: boolean }[];
    completed: boolean;
  }[];
}

export async function generateGoalRoadmap(goal: string, difficulty: string = 'Intermediate'): Promise<GoalRoadmap> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a detailed learning roadmap for the goal: "${goal}" at a ${difficulty} difficulty level. 
    Break it down into 3 logical learning paths (steps). 
    For each step, provide:
    1. A title and description.
    2. 3 actionable modules, each with a title and detailed educational content.
    3. 2-3 high-quality learning resources (articles, videos, or documentation) with title, URL, and type.
    
    Ensure the content is tailored to the ${difficulty} level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goal: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                completed: { type: Type.BOOLEAN },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING },
                      type: { type: Type.STRING }
                    },
                    required: ["title", "url", "type"]
                  }
                },
                modules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      completed: { type: Type.BOOLEAN }
                    },
                    required: ["title", "content", "completed"]
                  }
                }
              },
              required: ["title", "description", "modules", "completed", "resources"]
            }
          }
        },
        required: ["goal", "difficulty", "steps"]
      }
    }
  });

  const roadmap = JSON.parse(response.text || "{}");
  // Ensure completed status is false for all new roadmaps
  if (roadmap.steps) {
    roadmap.steps = roadmap.steps.map((step: any) => ({
      ...step,
      completed: false,
      modules: step.modules?.map((mod: any) => ({ ...mod, completed: false })) || []
    }));
  }
  return roadmap;
}
