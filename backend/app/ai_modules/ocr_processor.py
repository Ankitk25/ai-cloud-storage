import pytesseract
from PIL import Image
import PyPDF2
import io
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\ankit\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
class OCRProcessor:
    
    @staticmethod
    def extract_text_from_image(image_path):
        """Extract text from image using Tesseract OCR"""
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return {
                "text": text.strip(),
                "success": True,
                "char_count": len(text.strip())
            }
        except Exception as e:
            # Check if the error is specifically because Tesseract wasn't found
            if "tesseract is not installed" in str(e).lower() or "not found" in str(e).lower():
                 print("CRITICAL ERROR: Python cannot find tesseract.exe. Check the path in ocr_processor.py")
            
            print(f"OCR Error: {e}")
            return {
                "text": "",
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def extract_text_from_pdf(pdf_path):
        """Extract text from PDF"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            
            return {
                "text": text.strip(),
                "success": True,
                "page_count": len(pdf_reader.pages),
                "char_count": len(text.strip())
            }
        except Exception as e:
            print(f"PDF Extraction Error: {e}")
            return {
                "text": "",
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def extract_text(file_path, mime_type):
        """Extract text based on file type"""
        if mime_type and mime_type.startswith('image/'):
            return OCRProcessor.extract_text_from_image(file_path)
        elif mime_type == 'application/pdf':
            return OCRProcessor.extract_text_from_pdf(file_path)
        else:
            return {
                "text": "",
                "success": False,
                "error": "Unsupported file type for text extraction"
            }