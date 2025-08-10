from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
from typing import Optional
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Resume Assistant Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# File parsing function
def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            return f"Error reading PDF: {str(e)}"
            
    elif ext in (".docx", ".doc"):
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join(para.text for para in doc.paragraphs)
        except Exception as e:
            return f"Error reading Word document: {str(e)}"
            
    elif ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            return f"Error reading text file: {str(e)}"
    else:
        return f"Unsupported file type: {ext}"

# Enhanced Gemini API function with structured prompts
async def analyze_resume(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not found"}
    
    headers = {"Content-Type": "application/json"}
    
    # Enhanced prompt for structured output
    enhanced_prompt = f"""Analyze this resume and provide detailed feedback in a structured format:

RESUME CONTENT:
{prompt}

Please provide your analysis in the following structure:

**ATS COMPATIBILITY SCORE: X/100**

**OVERALL ASSESSMENT:**
- Overall Rating: X/10
- Key Strengths: (3-4 bullet points)
- Critical Issues: (2-3 bullet points)

**SKILLS ANALYSIS:**
- Technical Skills Found: (list)
- Missing Industry Keywords: (list)
- Recommended Skills to Add: (list)

**CONTENT OPTIMIZATION:**
- Sections Needing Improvement: (list)
- Quantifiable Achievements: (mention if missing)
- Action Verbs Usage: (rate and suggest)

**ATS OPTIMIZATION:**
- File Format Compatibility: (assess)
- Keyword Density: (rate)
- Section Headers: (assess standard format)
- Contact Information: (completeness)

**RECOMMENDATIONS:**
1. Top Priority Fix: 
2. Quick Wins: (3 items)
3. Long-term Improvements: (2 items)

Provide specific, actionable feedback that helps improve job application success rates."""

    json_data = {
        "contents": [{
            "parts": [{"text": enhanced_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1500,
        }
    }
    
    url_with_key = f"{BASE_URL}?key={GEMINI_API_KEY}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url_with_key, headers=headers, json=json_data)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API call failed: {response.status_code}"}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

# Cover letter generation function
async def generate_cover_letter(resume_text: str, job_description: str, tone: str = "professional") -> dict:
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not found"}
    
    headers = {"Content-Type": "application/json"}
    
    # Cover letter generation prompt
    cover_letter_prompt = f"""Generate a professional cover letter based on the following information:

RESUME SUMMARY:
{resume_text[:1000]}...

TARGET JOB DESCRIPTION:
{job_description}

TONE: {tone}

Please create a compelling cover letter that:
1. Opens with a strong hook related to the specific job
2. Highlights 2-3 most relevant experiences from the resume
3. Shows understanding of the company/role requirements
4. Demonstrates enthusiasm and cultural fit
5. Closes with a strong call to action

Format the cover letter professionally with proper paragraphs.
Keep it concise (250-400 words) and impactful.
Use the {tone} tone throughout.

Generate ONLY the cover letter content, no additional explanations."""

    json_data = {
        "contents": [{
            "parts": [{"text": cover_letter_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 800,
        }
    }
    
    url_with_key = f"{BASE_URL}?key={GEMINI_API_KEY}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url_with_key, headers=headers, json=json_data)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API call failed: {response.status_code}"}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

# Models
class ResumeAnalysisRequest(BaseModel):
    text: str

class ResumeAnalysisResponse(BaseModel):
    analysis: dict

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    tone: str = "professional"

class CoverLetterResponse(BaseModel):
    cover_letter: dict

# Routes
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/resume/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        result = await analyze_resume(request.text)
        return {"analysis": result}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/resume/analyze-file", response_model=ResumeAnalysisResponse)
async def analyze_resume_file(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Extract text
        resume_text = extract_text_from_file(temp_file_path)
        os.unlink(temp_file_path)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text")
        
        # Enhanced prompt with job description
        if job_description:
            enhanced_text = f"Resume:\n{resume_text}\n\nTarget Job:\n{job_description}\n\nAnalyze specifically for this job."
        else:
            enhanced_text = resume_text
        
        # Analyze
        result = await analyze_resume(enhanced_text)
        return {"analysis": result}
        
    except Exception as e:
        print(f"File analysis error: {str(e)}")
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")

@app.post("/cover-letter/generate", response_model=CoverLetterResponse)
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    try:
        result = await generate_cover_letter(request.resume_text, request.job_description, request.tone)
        return {"cover_letter": result}
    except Exception as e:
        print(f"Cover letter error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")
