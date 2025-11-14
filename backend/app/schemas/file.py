from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class FileUploadResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: Optional[str]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class FileListResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: Optional[str]
    category: Optional[str]
    tags: Optional[str]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class FileSearchResponse(BaseModel):
    files: List[FileListResponse]
    total: int