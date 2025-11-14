from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.base import Base

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String)
    
    # AI Generated fields (will populate later)
    tags = Column(String)  # JSON string of tags
    category = Column(String)
    extracted_text = Column(Text)  # OCR extracted text
    thumbnail_path = Column(String)
    image_hash = Column(String)  # For duplicate detection
    perceptual_hash = Column(String)  # For similar image detection
    file_hash = Column(String) 

    ai_processed = Column(Integer, default=0)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    owner = relationship("User", back_populates="files")