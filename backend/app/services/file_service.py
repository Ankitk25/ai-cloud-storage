import os
import aiofiles
import hashlib
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import asyncio

from ..models.file import File
from ..models.user import User
from ..core.config import settings
from database.session import async_session_maker
from .cloud_storage import cloud_storage

class FileService:
    
    @staticmethod
    async def process_file_with_ai(file_id: int, local_file_path: str = None):
        """Process file with AI in a new database session"""
        async with async_session_maker() as db:
            try:
                result = await db.execute(select(File).where(File.id == file_id))
                db_file = result.scalar_one_or_none()
                    
                if not db_file:
                    print(f"❌ File not found: {file_id}")
                    return
                
                    # If file is in cloud, we need local path for AI processing
                print(f"🔍 Processing file: {db_file.original_filename}")
                print(f"📁 Local path provided: {local_file_path}")
                print(f"☁️ Cloud path in DB: {db_file.file_path}")

                file_path_for_ai = local_file_path
                    
                if not file_path_for_ai:
                        # If no local path provided and file is cloud URL, skip AI
                    if db_file.file_path.startswith('http'):
                        print(f"⚠️ Skipping AI - file already in cloud without local copy")
                        return
                    file_path_for_ai = db_file.file_path

                print(f"🎯 Using this path for AI: {file_path_for_ai}")
            
            # Check if file exists
                if not os.path.exists(file_path_for_ai):
                    print(f"❌ Local file not found: {file_path_for_ai}")
                    return
                    
                    # Process with AI using local file
                from ..services.ai_service import AIService
                await AIService.process_file(db_file, db, file_path_override=file_path_for_ai)
                    
                    # Delete local file after AI processing if using cloud storage
                if settings.USE_CLOUD_STORAGE and local_file_path:
                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)
                        print(f"🗑️ Deleted local temp file: {local_file_path}")
                    
                print(f"✓ AI processing completed for: {db_file.original_filename}")
            except Exception as e:
                print(f"✗ AI processing failed: {e}")
                import traceback
                traceback.print_exc()   
                # Clean up local file even on error
                if settings.USE_CLOUD_STORAGE and local_file_path:
                    if os.path.exists(local_file_path):
                        os.remove(local_file_path)

    
    @staticmethod
    def generate_unique_filename(original_filename: str, user_id: int) -> str:
        """Generate unique filename using timestamp and hash"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(original_filename)
        hash_str = hashlib.md5(f"{user_id}{timestamp}{name}".encode()).hexdigest()[:8]
        return f"{timestamp}_{hash_str}{ext}"
    
    @staticmethod
    def validate_file(file: UploadFile) -> None:
        """Validate file extension and size"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        allowed_exts = settings.ALLOWED_EXTENSIONS.split(",")
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed types: {allowed_exts}"
            )
    
    @staticmethod
    async def calculate_file_hash(file_content: bytes) -> str:
        """Calculate MD5 hash of file content"""
        return hashlib.md5(file_content).hexdigest()
    
    @staticmethod
    async def check_for_duplicates(file_hash: str, user: User, db: AsyncSession):
        """Check if file with same hash exists"""
        result = await db.execute(
            select(File).where(
                File.user_id == user.id,
                File.file_hash == file_hash
            )
        )
        duplicate = result.scalar_one_or_none()
        
        if duplicate:
            return {
                "is_duplicate": True,
                "existing_file": {
                    "id": duplicate.id,
                    "filename": duplicate.original_filename,
                    "size": duplicate.file_size,
                    "uploaded_at": duplicate.uploaded_at.isoformat()
                }
            }
        
        return {"is_duplicate": False}
    
    @staticmethod
    async def check_similar_images(file_path: str, user: User, db: AsyncSession):
        """Check for visually similar images using perceptual hashing"""
        try:
            from ..ai_modules.duplicate_detector import DuplicateDetector
            
            hash_result = DuplicateDetector.calculate_image_hash(file_path)
            
            if not hash_result['success']:
                return {"is_similar": False, "perceptual_hash": None}
            
            new_phash = hash_result['perceptual_hash']
            
            result = await db.execute(
                select(File).where(
                    File.user_id == user.id,
                    File.perceptual_hash.isnot(None)
                )
            )
            existing_images = result.scalars().all()
            
            for existing in existing_images:
                if DuplicateDetector.are_images_similar(
                    new_phash, 
                    existing.perceptual_hash, 
                    threshold=5
                ):
                    return {
                        "is_similar": True,
                        "perceptual_hash": new_phash,
                        "existing_file": {
                            "id": existing.id,
                            "filename": existing.original_filename,
                            "size": existing.file_size,
                            "uploaded_at": existing.uploaded_at.isoformat()
                        }
                    }
            
            return {"is_similar": False, "perceptual_hash": new_phash}
            
        except Exception as e:
            print(f"Similar image check error: {e}")
            return {"is_similar": False, "perceptual_hash": None}
    
    @staticmethod
    async def save_file(
        file: UploadFile, 
        user: User, 
        db: AsyncSession,
        force_upload: bool = False
    ):
        """Save file with duplicate detection"""
        
        FileService.validate_file(file)
        
        file_content = await file.read()
        await file.seek(0)
        
        file_hash = await FileService.calculate_file_hash(file_content)
        
        if not force_upload:
            duplicate_check = await FileService.check_for_duplicates(file_hash, user, db)
            
            if duplicate_check['is_duplicate']:
                return {
                    "status": "duplicate_found",
                    "duplicate_type": "exact",
                    "existing_file": duplicate_check['existing_file']
                }

        
        unique_filename = FileService.generate_unique_filename(file.filename, user.id)
        
        user_dir = os.path.join(settings.UPLOAD_DIR, str(user.id))
        os.makedirs(user_dir, exist_ok=True)
        
        file_path = os.path.join(user_dir, unique_filename)
        
        file_size = len(file_content)
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / (1024*1024)}MB"
            )
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(file_content)

        perceptual_hash = None

        if not force_upload and file.content_type and file.content_type.startswith('image/'):
            similar_check = await FileService.check_similar_images(file_path, user, db)
            
            if similar_check['is_similar']:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return {
                    "duplicate_detected": True,
                    "duplicate_type": "similar",
                    "existing_file": similar_check['existing_file']
                }
            
            perceptual_hash = similar_check.get('perceptual_hash')
        
        cloud_url = None
        object_key = f"{user.id}/{unique_filename}"

        if settings.USE_CLOUD_STORAGE:
            # DON'T delete local file yet - AI needs it
            with open(file_path, 'rb') as file_data:
                cloud_storage.s3_client.upload_fileobj(
                    file_data,
                    cloud_storage.bucket_name,
                    object_key,
                    ExtraArgs={'ContentType': cloud_storage._get_content_type(file_path)}
                )
            cloud_url = f"{settings.R2_PUBLIC_URL}/{object_key}"
            print(f"✓ Uploaded to cloud: {object_key}")
            print(f"☁️ Cloud URL: {cloud_url}")

        # Upload to cloud if enabled
        
        db_file = File(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=cloud_url or file_path,  # Store cloud URL if available
            file_size=file_size,
            mime_type=file.content_type,
            user_id=user.id,
            file_hash=file_hash,
            perceptual_hash=perceptual_hash,
            ai_processed=0

        )
        
        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)
        
        print(f"=" * 50)
        print(f"DEBUG: About to trigger AI")
        print(f"File ID: {db_file.id}")
        print(f"Local path exists: {os.path.exists(file_path)}")
        print(f"Local path: {file_path}")
        print(f"Cloud URL: {cloud_url}")
        print(f"=" * 50)
        
        # Trigger AI processing in background
        print(f"🚀 Triggering AI processing for: {db_file.original_filename}")
        asyncio.create_task(FileService.process_file_with_ai(db_file.id, file_path))
        
        return {
            "duplicate_detected": False,
            "file": db_file
        }
    
    @staticmethod
    async def get_user_files(user: User, db: AsyncSession) -> List[File]:
        """Get all files for a user"""
        result = await db.execute(
            select(File)
            .where(File.user_id == user.id)
            .order_by(File.uploaded_at.desc())
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_file_by_id(file_id: int, user: User, db: AsyncSession) -> File:
        """Get a specific file"""
        result = await db.execute(
            select(File).where(File.id == file_id, File.user_id == user.id)
        )
        file = result.scalar_one_or_none()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        return file
    
    @staticmethod
    async def delete_file(file_id: int, user: User, db: AsyncSession) -> bool:
        """Delete a file"""
        file = await FileService.get_file_by_id(file_id, user, db)
        
        # Delete physical file
        if os.path.exists(file.file_path):
            try:
                os.remove(file.file_path)
            except Exception as e:
                print(f"Error deleting file: {e}")
        
        # Delete thumbnail if exists
        if file.thumbnail_path and os.path.exists(file.thumbnail_path):
            try:
                os.remove(file.thumbnail_path)
            except Exception as e:
                print(f"Error deleting thumbnail: {e}")
        
        # Delete database entry
        await db.delete(file)
        await db.commit()
        
        return True