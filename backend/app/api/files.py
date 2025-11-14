from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os

from database.session import get_db
from ..models.user import User
from ..core.deps import get_current_user
from ..schemas.file import FileUploadResponse, FileListResponse
from ..services.file_service import FileService

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new file"""
    
    db_file = await FileService.save_file(file, current_user, db)
    return db_file

@router.get("/", response_model=List[FileListResponse])
async def list_files(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all files for current user"""
    
    files = await FileService.get_user_files(current_user, db)
    return files

@router.get("/{file_id}", response_model=FileListResponse)
async def get_file_info(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get file information"""
    
    file = await FileService.get_file_by_id(file_id, current_user, db)
    return file

@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Download a file"""
    
    file = await FileService.get_file_by_id(file_id, current_user, db)
    
    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file.file_path,
        filename=file.original_filename,
        media_type=file.mime_type
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a file"""
    
    await FileService.delete_file(file_id, current_user, db)
    return {"message": "File deleted successfully"}