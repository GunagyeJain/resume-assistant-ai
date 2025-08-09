from app.utils.config import GEMINI_API_KEY

if GEMINI_API_KEY:
    print(f"API Key loaded: {GEMINI_API_KEY[:10]}...")
else:
    print("ERROR: API Key not loaded!")
