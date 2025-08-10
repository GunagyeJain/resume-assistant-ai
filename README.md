# 🤖 AI Resume & Portfolio Assistant

> **AgentForce Hackathon 2025 - Track 1 Submission**
> 
> An AI-powered career assistant that transforms resume optimization and cover letter creation with visual analytics and intelligent feedback.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%2BFastAPI%2BGemini-blue)
![Features](https://img.shields.io/badge/Features-Multi%20Format%2BVisual%20Analytics-orange)

## 🌟 Key Features

### 📄 **Smart Resume Analysis**
- **Multi-format support**: PDF, DOCX, TXT files
- **ATS Compatibility Scoring**: Visual 0-100 scoring with color-coded feedback
- **AI-powered insights**: Detailed analysis using Google Gemini API
- **Interactive dashboard**: Animated charts and progress indicators

### ✍️ **Intelligent Cover Letter Generation**
- **Multiple tone options**: Professional, Enthusiastic, Creative, Confident
- **Job-specific customization**: Tailored to job descriptions
- **Instant generation**: AI-powered content creation
- **Export options**: Copy to clipboard and download

### 🎨 **Premium User Experience**
- **Modern UI**: Professional dashboard with smooth animations
- **Visual feedback**: Interactive charts and progress bars
- **Responsive design**: Works seamlessly on all devices
- **Real-time processing**: Instant analysis and feedback

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API key

### Installation

1. **Clone the repository**

2. **Backend Setup**
Create virtual environment
python -m venv venv

Activate virtual environment
Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

Install dependencies
pip install fastapi uvicorn python-dotenv httpx PyPDF2 python-docx python-multipart

Create .env file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > backend/.env


3. **Frontend Setup**
cd frontend
npm install


### Running the Application

1. **Start Backend** (in one terminal)
cd backend
python -m uvicorn simple_main:app --reload


2. **Start Frontend** (in another terminal)
cd frontend
npm run dev


3. **Open**: http://localhost:3000

## 🏗️ Architecture

AI Resume Assistant
├── Backend (FastAPI)
│ ├── Resume parsing (PDF, DOCX, TXT)
│ ├── Google Gemini API integration
│ ├── Cover letter generation
│ └── Structured analysis endpoints
└── Frontend (React + TypeScript)
├── File upload with drag-and-drop
├── Visual analytics dashboard
├── Interactive charts and animations
└── Modern responsive design


## 🛠️ Technology Stack

- **Backend**: FastAPI, Python, Google Gemini API
- **Frontend**: React, TypeScript, Vite
- **UI Libraries**: Framer Motion, Recharts, Lucide Icons
- **File Processing**: PyPDF2, python-docx
- **Styling**: CSS Modules with custom animations

## 🎯 Hackathon Highlights

### **Innovation & Problem Relevance**
- Addresses real career development challenges
- Visual analytics for ATS optimization
- Multi-modal AI analysis

### **Technical Soundness**
- Robust file processing pipeline
- Structured AI prompting for consistent results
- Error handling and validation

### **UX/UI Excellence**
- Premium SaaS-quality design
- Smooth animations and micro-interactions
- Intuitive user flow

### **Working Demo**
- Full end-to-end functionality
- Real-time processing
- Professional presentation ready

## 📊 Features Demo

1. **Upload Resume** → Drag & drop PDF/DOCX/TXT
2. **Add Job Description** → Paste target job requirements
3. **Get Visual Analysis** → See ATS score, ratings, recommendations
4. **Generate Cover Letter** → Choose tone and get personalized content
5. **Export Results** → Download analysis and cover letter

## 🔧 API Endpoints

- `GET /health` - Health check
- `POST /resume/analyze` - Text-based resume analysis
- `POST /resume/analyze-file` - File-based resume analysis
- `POST /cover-letter/generate` - Cover letter generation

## 📈 Future Enhancements

- LinkedIn profile integration
- GitHub portfolio analysis
- Batch processing capabilities
- Advanced export options
- Mobile app version

---

