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
    async def process_file(file: File, db: AsyncSession):
        """Process file with AI analysis"""
        try:
            file.ai_processed = 1  # Processing
            await db.commit()
            
            mime_type = file.mime_type or ""
            
            # Process images
            if mime_type.startswith('image/'):
                await AIService._process_image(file, db)
            
            # Process documents with OCR
            elif mime_type in ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']:
                await AIService._process_document(file, db)
            
            # Calculate file hash for all files
            hash_result = DuplicateDetector.calculate_file_hash(file.file_path)
            if hash_result['success']:
                file.file_hash = hash_result['hash']
            
            file.ai_processed = 2  # Complete
            await db.commit()
            
            return {"success": True, "message": "AI processing complete"}
            
        except Exception as e:
            print(f"AI Processing Error: {e}")
            file.ai_processed = 3  # Failed
            await db.commit()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def _process_image(file: File, db: AsyncSession):
        """Process image files"""
        # 1. Image analysis (tags and category)
        analyzer = get_image_analyzer()
        analysis = analyzer.analyze_image(file.file_path)
        
        if analysis['success']:
            file.tags = json.dumps(analysis['tags'])
            file.category = analysis['category']
        
        # 2. Generate thumbnail
        thumbnail_dir = os.path.join(settings.UPLOAD_DIR, 'thumbnails', str(file.user_id))
        thumbnail_filename = f"thumb_{file.filename}"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        
        thumb_result = ThumbnailGenerator.create_thumbnail(file.file_path, thumbnail_path)
        if thumb_result['success']:
            file.thumbnail_path = thumbnail_path
        
        # 3. Calculate image hashes for duplicate detection
        hash_result = DuplicateDetector.calculate_image_hash(file.file_path)
        if hash_result['success']:
            file.image_hash = hash_result['average_hash']
            file.perceptual_hash = hash_result['perceptual_hash']
        
        # 4. OCR for text in images
        ocr_result = OCRProcessor.extract_text_from_image(file.file_path)
        if ocr_result['success'] and ocr_result['char_count'] > 10:
            file.extracted_text = ocr_result['text'][:5000]  # Limit to 5000 chars
    
    @staticmethod
    async def _process_document(file: File, db: AsyncSession):
        """Process document files"""
        ocr_result = OCRProcessor.extract_text(file.file_path, file.mime_type)
        
        if ocr_result['success'] and ocr_result['char_count'] > 10:
            file.extracted_text = ocr_result['text'][:10000]  # Limit to 10000 chars
            
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