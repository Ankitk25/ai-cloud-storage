import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.file import File
from ..ai_modules.image_analyzer import get_image_analyzer
from ..ai_modules.ocr_processor import OCRProcessor
from ..ai_modules.duplicate_detector import DuplicateDetector
from ..ai_modules.thumbnail_generator import ThumbnailGenerator
from ..core.config import settings

class AIService:
    
    @staticmethod
    async def process_file(file: File, db: AsyncSession, file_path_override: str = None):
        """Process file with AI analysis"""
        try:
            file.ai_processed = 1  # Processing
            await db.commit()
            
            # Use override path if provided, otherwise use stored path
            file_path = file_path_override or file.file_path
            
            print(f"🤖 AI Service: Processing {file.original_filename}")
            print(f"📂 File path: {file_path}")
            
            # Check if file exists
            if not os.path.exists(file_path):
                print(f"❌ File not found at: {file_path}")
                file.ai_processed = 3  # Failed
                await db.commit()
                return {"success": False, "error": "File not found"}
            
            mime_type = file.mime_type or ""
            
            # Process images
            if mime_type.startswith('image/'):
                print(f"🖼️ Processing as image...")
                await AIService._process_image(file, db, file_path)
            
            # Process documents with OCR
            elif mime_type in ['application/pdf']:
                print(f"📄 Processing as PDF...")
                await AIService._process_document(file, db, file_path)
            
            # Calculate file hash for all files (if not already done)
            if not file.file_hash and os.path.exists(file_path):
                hash_result = DuplicateDetector.calculate_file_hash(file_path)
                if hash_result['success']:
                    file.file_hash = hash_result['hash']
            
            file.ai_processed = 2  # Complete
            await db.commit()
            
            print(f"✅ AI processing complete for: {file.original_filename}")
            print(f"   Tags: {file.tags}")
            print(f"   Category: {file.category}")
            
            return {"success": True, "message": "AI processing complete"}
            
        except Exception as e:
            print(f"❌ AI Processing Error: {e}")
            import traceback
            traceback.print_exc()
            file.ai_processed = 3  # Failed
            await db.commit()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def _process_image(file: File, db: AsyncSession, file_path: str):
        """Process image files"""
        
        # 1. Image analysis (tags and category)
        try:
            print(f"   🏷️ Running CLIP analysis...")
            analyzer = get_image_analyzer()
            analysis = analyzer.analyze_image(file_path)
            
            if analysis['success']:
                file.tags = json.dumps(analysis['tags'])
                file.category = analysis['category']
                print(f"   ✓ Tags generated: {analysis['tags']}")
                print(f"   ✓ Category: {analysis['category']}")
            else:
                print(f"   ✗ Image analysis failed")
        except Exception as e:
            print(f"   ✗ Image analysis error: {e}")
        
        # 2. Generate thumbnail
        try:
            print(f"   🎨 Generating thumbnail...")
            thumbnail_dir = os.path.join(settings.UPLOAD_DIR, 'thumbnails', str(file.user_id))
            thumbnail_filename = f"thumb_{file.filename}"
            thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
            
            thumb_result = ThumbnailGenerator.create_thumbnail(file_path, thumbnail_path)
            if thumb_result['success']:
                file.thumbnail_path = thumbnail_path
                print(f"   ✓ Thumbnail created")
            else:
                print(f"   ✗ Thumbnail failed")
        except Exception as e:
            print(f"   ✗ Thumbnail error: {e}")
        
        # 3. Calculate image hashes for duplicate detection (if not already done)
        try:
            if not file.image_hash:
                print(f"   🔍 Calculating image hashes...")
                hash_result = DuplicateDetector.calculate_image_hash(file_path)
                if hash_result['success']:
                    file.image_hash = hash_result['average_hash']
                    file.perceptual_hash = hash_result['perceptual_hash']
                    print(f"   ✓ Hashes calculated")
        except Exception as e:
            print(f"   ✗ Hash calculation error: {e}")
        
        # 4. OCR for text in images
        try:
            print(f"   📝 Running OCR...")
            ocr_result = OCRProcessor.extract_text_from_image(file_path)
            if ocr_result['success'] and ocr_result['char_count'] > 10:
                file.extracted_text = ocr_result['text'][:5000]
                print(f"   ✓ OCR extracted {ocr_result['char_count']} characters")
            else:
                print(f"   ℹ️ No text found in image")
        except Exception as e:
            print(f"   ✗ OCR error: {e}")
    
    @staticmethod
    async def _process_document(file: File, db: AsyncSession, file_path: str):
        """Process document files"""
        
        try:
            print(f"   📄 Extracting text from PDF...")
            ocr_result = OCRProcessor.extract_text(file_path, file.mime_type)
            
            if ocr_result['success'] and ocr_result['char_count'] > 10:
                file.extracted_text = ocr_result['text'][:10000]
                print(f"   ✓ Extracted {ocr_result['char_count']} characters")
                
                # Simple category based on extracted text
                text_lower = ocr_result['text'].lower()
                if any(word in text_lower for word in ['invoice', 'receipt', 'payment']):
                    file.category = 'financial'
                elif any(word in text_lower for word in ['contract', 'agreement', 'terms']):
                    file.category = 'legal'
                elif any(word in text_lower for word in ['report', 'analysis', 'summary']):
                    file.category = 'report'
                else:
                    file.category = 'document'
                
                print(f"   ✓ Category: {file.category}")
            else:
                print(f"   ✗ Text extraction failed or no text found")
        except Exception as e:
            print(f"   ✗ Document processing error: {e}")