import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def test_gemini():
    if not GEMINI_API_KEY:
        print("❌ No API key found!")
        return
    
    print(f"✅ API Key found: {GEMINI_API_KEY[:10]}...")
    
    # Test with a simple request
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json",
    }
    
    json_data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Hello, can you respond with 'API working'?"
                    }
                ]
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=json_data)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ Gemini API is working!")
            else:
                print("❌ API call failed")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# Run the test
asyncio.run(test_gemini())
