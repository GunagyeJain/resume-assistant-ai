import httpx
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def analyze_resume(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not found in environment variables")
    
    # Try multiple model variants
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.0-pro",
        "gemini-pro"
    ]
    
    for model in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            
            headers = {
                "Content-Type": "application/json",
            }
            
            json_data = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": f"""Analyze this resume and provide feedback:

{prompt}

Please provide:
1. Overall score (1-10)
2. Key strengths
3. Areas for improvement
4. Missing keywords"""
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1000,
                }
            }
            
            print(f"Trying model: {model}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=json_data)
                
                print(f"Response status: {response.status_code}")
                print(f"Response headers: {dict(response.headers)}")
                
                if response.status_code == 200:
                    result = response.json()
                    print("✅ Success with model:", model)
                    return result
                else:
                    print(f"❌ Failed with {model}: {response.status_code}")
                    print(f"Response text: {response.text}")
                    
        except Exception as e:
            print(f"❌ Exception with {model}: {str(e)}")
            continue
    
    # If all models failed, return a mock response for testing
    print("⚠️ All models failed, returning mock response")
    return {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": """**Resume Analysis (Mock Response)**

**Overall Score: 7/10**

**Key Strengths:**
- Good technical skills mentioned
- Clear experience section
- Relevant education background

**Areas for Improvement:**
- Add more quantified achievements
- Include more industry keywords
- Improve formatting for ATS systems

**Missing Keywords:**
- Cloud technologies (AWS, Azure)
- Project management
- Team collaboration

*Note: This is a test response. Please check your Gemini API key and internet connection.*"""
                        }
                    ]
                }
            }
        ]
    }
