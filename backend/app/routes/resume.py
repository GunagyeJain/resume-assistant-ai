from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
import tempfile
import os
from typing import Optional
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import your modules
from app.utils.gemini_client import analyze_resume
from app.utils.file_parser import extract_text_from_file

router = APIRouter(prefix="/resume", tags=["Resume"])

class ResumeAnalysisRequest(BaseModel):
    text: str

class ResumeAnalysisResponse(BaseModel):
    analysis: dict

# Keep existing text-based endpoint for frontend compatibility
@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        result = await analyze_resume(request.text)
        return {"analysis": result}
    except Exception as e:
        print(f"Error in resume analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# New file upload endpoint
@router.post("/analyze-file", response_model=ResumeAnalysisResponse)
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

        # Extract text from file
        resume_text = extract_text_from_file(temp_file_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Enhance prompt with job description if provided
        enhanced_prompt = resume_text
        if job_description:
            enhanced_prompt = f"""Resume Content:
{resume_text}

Target Job Description:
{job_description}

Please analyze this resume specifically for the target job above."""

        # Analyze with Gemini
        result = await analyze_resume(enhanced_prompt)
        
        return {"analysis": result}
        
    except Exception as e:
        print(f"Error in file analysis: {str(e)}")
        # Clean up temp file if it exists
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")
