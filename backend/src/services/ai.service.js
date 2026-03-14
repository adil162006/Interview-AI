const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Zod schema used ONLY for validation after parsing
const interviewReportSchema = z.object({
    title: z.string(),
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
})

// Gemini-compatible OpenAPI schema (defined manually)
const geminiResponseSchema = {
    type: "object",
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"],
    properties: {
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        },
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate matches the job"
        },
        technicalQuestions: {
            type: "array",
            description: "Exactly 5 technical questions for the interview",
            items: {
                type: "object",
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string", description: "The technical interview question" },
                    intention: { type: "string", description: "Why the interviewer asks this question" },
                    answer: { type: "string", description: "How to answer this question effectively" }
                }
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "Exactly 3 behavioral questions for the interview",
            items: {
                type: "object",
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string", description: "The behavioral interview question" },
                    intention: { type: "string", description: "Why the interviewer asks this question" },
                    answer: { type: "string", description: "How to answer this question effectively" }
                }
            }
        },
        skillGaps: {
            type: "array",
            description: "Exactly 3 skill gaps identified in the candidate profile",
            items: {
                type: "object",
                required: ["skill", "severity"],
                properties: {
                    skill: { type: "string", description: "The skill the candidate is lacking" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "How critical this skill gap is for the role"
                    }
                }
            }
        },
        preparationPlan: {
            type: "array",
            description: "A 7-day preparation plan for the candidate",
            items: {
                type: "object",
                required: ["day", "focus", "tasks"],
                properties: {
                    day: { type: "number", description: "Day number starting from 1" },
                    focus: { type: "string", description: "Main topic to focus on this day" },
                    tasks: {
                        type: "array",
                        description: "List of specific tasks for this day",
                        items: { type: "string" }
                    }
                }
            }
        }
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `
You are an expert technical interviewer and career coach.

Analyze the candidate's resume, self-description, and the job description, then generate a detailed interview preparation report.

Resume:
${resume}

Candidate Self-Description:
${selfDescription}

Job Description:
${jobDescription}

Generate the report with:
- EXACTLY 5 technical questions
- EXACTLY 3 behavioral questions  
- EXACTLY 3 skill gaps
- EXACTLY 7 days in the preparation plan
`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
        }
    })

    const parsed = JSON.parse(response.text)
    const validated = interviewReportSchema.parse(parsed)

    return validated
}

module.exports = { generateInterviewReport }