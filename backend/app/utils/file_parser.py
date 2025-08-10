import os
import docx
from PyPDF2 import PdfReader

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        reader = PdfReader(file_path)
        return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    elif ext in (".docx", ".doc"):
        doc = docx.Document(file_path)
        return "\n".join(para.text for para in doc.paragraphs)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        raise ValueError("Unsupported file type")
