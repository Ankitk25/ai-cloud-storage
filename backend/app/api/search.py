from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from database.session import get_db
from ..models.user import User
from ..models.file import File
from ..core.deps import get_current_user
from ..schemas.file import FileListResponse

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=List[FileListResponse])
async def search_files(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search files by name, tags, category, or extracted text"""
    
    search_term = f"%{q.lower()}%"
    
    result = await db.execute(
        select(File).where(
            File.user_id == current_user.id,
            or_(
                File.original_filename.ilike(search_term),
                File.tags.ilike(search_term),
                File.category.ilike(search_term),
                File.extracted_text.ilike(search_term)
            )
        ).order_by(File.uploaded_at.desc())
    )
    
    return result.scalars().all()

@router.get("/by-category/{category}", response_model=List[FileListResponse])
async def get_files_by_category(
    category: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all files in a specific category"""
    
    result = await db.execute(
        select(File).where(
            File.user_id == current_user.id,
            File.category == category
        ).order_by(File.uploaded_at.desc())
    )
    
    return result.scalars().all()