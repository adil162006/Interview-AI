const pdfParse = require("pdf-parse")
const { generateInterviewReport } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription, title, report } = req.body

    // Allow caller to provide a full report payload for testing (as JSON string in form-data)
    let interViewReportByAi = null
    if (report) {
        try {
            interViewReportByAi = typeof report === "string" ? JSON.parse(report) : report
        } catch (err) {
            return res.status(400).json({ message: "Invalid JSON for 'report' field." })
        }
    }

    if (!interViewReportByAi) {
        interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })
    }

    // Ensure required fields exist and have correct types so Mongoose validation does not fail
    const reportPayload = {
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        title: title ?? interViewReportByAi.title ?? "Interview Report",
        technicalQuestions: Array.isArray(interViewReportByAi.technicalQuestions)
            ? interViewReportByAi.technicalQuestions
            : [],
        behavioralQuestions: Array.isArray(interViewReportByAi.behavioralQuestions)
            ? interViewReportByAi.behavioralQuestions
            : [],
        skillGaps: Array.isArray(interViewReportByAi.skillGaps)
            ? interViewReportByAi.skillGaps
            : [],
        preparationPlan: Array.isArray(interViewReportByAi.preparationPlan)
            ? interViewReportByAi.preparationPlan.map((item) => ({
                  day: Number(item?.day) || 1,
                  focus: item?.focus || "",
                  tasks: Array.isArray(item?.tasks) ? item.tasks : []
              }))
            : [],
        matchScore: Number(interViewReportByAi.matchScore) || 0,
        ...interViewReportByAi
    }

    const interviewReport = await interviewReportModel.create(reportPayload)

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}


module.exports = {generateInterViewReportController}