const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

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


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }
