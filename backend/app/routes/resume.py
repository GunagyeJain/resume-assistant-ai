from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

# Add the parent directory to the path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.gemini_client import analyze_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

class ResumeAnalysisRequest(BaseModel):
    text: str

class ResumeAnalysisResponse(BaseModel):
    analysis: dict

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        result = await analyze_resume(request.text)
        return {"analysis": result}
    except Exception as e:
        # Log the actual error for debugging
        print(f"Error in resume analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
