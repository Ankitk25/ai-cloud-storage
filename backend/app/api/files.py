from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException, Query
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

@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    force: bool = Query(False, description="Force upload even if duplicate"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new file"""
    
    result = await FileService.save_file(file, current_user, db, force_upload=force)
    
    if result.get('duplicate_detected'):
        return {
            "status": "duplicate_found",
            "duplicate_type": result.get('duplicate_type'),
            "existing_file": result['existing_file']
        }
    
    return {
        "status": "success",
        "message": "File uploaded successfully",
        "file": {
            "id": result['file'].id,
            "filename": result['file'].filename,
            "original_filename": result['file'].original_filename,
            "file_size": result['file'].file_size,
            "mime_type": result['file'].mime_type,
            "uploaded_at": result['file'].uploaded_at.isoformat()
        }
    }

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
    
   # FIRST check cloud
    if file.file_path.startswith('http'):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=file.file_path)

    # THEN check local
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
