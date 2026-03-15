<div align="center">

# 🤖 Interview AI

**An intelligent, full-stack platform that leverages Google Gemini to generate highly personalized interview preparation reports and tailored resumes.**

[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-success?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📖 Project Overview

**Interview AI** is an advanced career-coaching web application designed to help job seekers land their dream roles. By analyzing a candidate's uploaded resume (PDF), self-description, and target job description, the platform utilizes Google's GenAI (`gemini-2.5-flash`) to bridge the gap between candidate experience and employer expectations.

## 💡 The Problem It Solves

Generic interview preparation often fails to address the specific nuances of a candidate's background compared to exact job requirements. Interview AI acts as a **personal technical interviewer**, offering targeted guidance, highlighting critical skill gaps, and generating an actionable 7-day preparation roadmap tailored *specifically* to the candidate and the job they are applying for.

## ✨ Key Features

- 📄 **Resume Parsing:** Upload PDF resumes to automatically extract text for AI context using `pdf-parse`.
- 🧠 **AI-Powered Analysis:** Seamless integration with Google GenAI SDK for intelligent candidate-to-job matching.
- 📝 **Custom Interview Questions:** Generates **5 technical** and **3 behavioral** questions, complete with expected answers and interviewer intentions.
- 🎯 **Match Scoring & Skill Gaps:** Calculates a candidate-to-job match score (0-100) and identifies the top 3 critical skill gaps (low/medium/high severity).
- 🗓️ **7-Day Prep Plan:** Provides an actionable, day-by-day task list to prepare for the specific role.
- 🖨️ **Dynamic ATS Resume Generation:** Automatically generates a tailored, ATS-friendly resume as an HTML document and converts it to a downloadable PDF using `puppeteer`.
- 🔐 **Secure Authentication:** Complete user flow with secure signup, login, logout, and JWT cookie-based session management.

## 🏗️ Architecture Overview

The application follows a standard Client-Server architecture:
- **Frontend Panel:** A Single Page Application (SPA) built with React and Vite. It communicates with the backend REST APIs using `axios`, handling routing via `react-router-dom` and styling using `SCSS/SASS`.
- **Backend API:** A RESTful Express.js server connected to a MongoDB database. It uses `multer` for handling PDF uploads, structured AI prompting via Zod schemas, and `puppeteer` for server-side HTML-to-PDF generation.

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router v7
- **Styling:** SASS / SCSS
- **Network:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB & Mongoose
- **AI Integration:** `@google/genai`
- **Validation:** Zod & `zod-to-json-schema`
- **Utilities:** `multer`, `pdf-parse`, `puppeteer`, `bcryptjs`, `jsonwebtoken`

## 📁 Folder Structure

```text
interview-ai/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── features/         # Feature-based modular structure
│   │   │   ├── auth/         # Login, Register pages & auth components
│   │   │   └── interview/    # Home dashboard, Interview report pages
│   │   ├── styles/           # Global SCSS styling
│   │   ├── App.jsx           # Root component
│   │   └── app.routes.jsx    # Client-side routing definition
│   ├── vite.config.js
│   └── package.json
│
└── backend/                  # Express API Server
    ├── src/
    │   ├── config/           # DB connection (database.js)
    │   ├── controllers/      # Route logic (auth & interview controller)
    │   ├── middlewares/      # JWT auth guard, Multer file upload
    │   ├── models/           # Mongoose schemas (User, InterviewReport, Blacklist)
    │   ├── routes/           # Express routers
    │   ├── services/         # Business logic (Google GenAI integration)
    │   └── app.js            # Express app configuration
    ├── server.js             # Entry point
    └── package.json
```

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Server Port (Default: 3000)
PORT=3000

# MongoDB Connection String
MONGO_URI=your_mongodb_connection_string

# JWT Secret for Session Cookies
JWT_SECRET=your_super_secret_jwt_key

# Google Gemini API Key
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- A Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install

# Make sure your .env is configured!
npm run dev
```
*The backend will start at `http://localhost:3000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start at `http://localhost:5173`.*

---

## 📡 API Documentation

### **Auth Routes** (`/api/auth`)
| Method | Endpoint    | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login`    | Login user & return cookie | Public |
| `GET`  | `/get-me`   | Fetch logged-in user details | Private |
| `GET`  | `/logout`   | Clear cookie and blacklist token | Public |

### **Interview Routes** (`/api/interview`)
| Method | Endpoint    | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Generate new interview report (expects `resume` PDF, `selfDescription`, `jobDescription`) | Private |
| `GET`  | `/` | Get all generated interview reports for the user | Private |
| `GET`  | `/report/:interviewId` | Get a specific interview report by ID | Private |
| `POST` | `/resume/pdf/:interviewReportId` | Generate a tailored ATS resume PDF | Private |

---

## 🔮 Future Roadmap

- [ ] **Multi-Format Support:** Allow `.docx` and `.txt` parsing alongside PDFs.
- [ ] **Mock Audio Interviews:** Convert text-based AI questions into real-time voice conversations using WebRTC + TTS/STT.
- [ ] **AI Chat Assistant:** Real-time conversational helper for immediate interview tip generation.
- [ ] **Email Notifications:** Send candidates their generated PDFs directly to their inbox.

## 🤝 Contribution Guide

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **ISC License**.
