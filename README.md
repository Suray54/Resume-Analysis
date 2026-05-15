# Resume Analyzer

An AI-powered web application that analyzes resumes against job descriptions using Google Gemini AI, providing detailed feedback, ATS scores, and improvement suggestions.

## Features

- Upload PDF resumes and get instant AI analysis
- Compare resumes against specific job titles and descriptions
- Receive comprehensive feedback on content, structure, skills, and tone
- Get ATS compatibility scores
- Keyword matching analysis
- Secure authentication via Puter.js

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- A Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Puter.js (storage & auth)
- PDF.js (PDF processing)
