import os
import aiofiles
import hashlib
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import async_session_maker 
from typing import List
from .ai_service import AIService
import asyncio

from ..models.file import File
from ..models.user import User
from ..core.config import settings

class FileService:

    @staticmethod
    async def process_file_with_ai(file_id: int): 
        async with async_session_maker() as db:
            result = await db.execute(select(File).where(File.id == file_id))
            db_file = result.scalar_one_or_none()
            
            if db_file:
                await AIService.process_file(db_file, db)
    
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
        allowed_exts = settings.ALLOWED_EXTENSIONS.split(",")
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed types: {allowed_exts}"
            )
    
    @staticmethod
    async def save_file(file: UploadFile, user: User, db: AsyncSession) -> File:
        """Save file to storage and create database entry"""
        
        # Validate file
        FileService.validate_file(file)
        
        # Generate unique filename
        unique_filename = FileService.generate_unique_filename(file.filename, user.id)
        
        # Create user directory if doesn't exist
        user_dir = os.path.join(settings.UPLOAD_DIR, str(user.id))
        os.makedirs(user_dir, exist_ok=True)
        
        file_path = os.path.join(user_dir, unique_filename)
        
        # Save file
        file_size = 0
        async with aiofiles.open(file_path, 'wb') as out_file:
            while content := await file.read(1024 * 1024):  # Read in 1MB chunks
                file_size += len(content)
                
                # Check file size limit
                if file_size > settings.MAX_FILE_SIZE:
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / (1024*1024)}MB"
                    )
                
                await out_file.write(content)
        
        # Create database entry
        db_file = File(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=file.content_type,
            user_id=user.id
        )
        
        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)
        
        asyncio.create_task(FileService.process_file_with_ai(db_file.id))

        return db_file
    
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
            os.remove(file.file_path)
        
        # Delete database entry
        await db.delete(file)
        await db.commit()
        
        return True
