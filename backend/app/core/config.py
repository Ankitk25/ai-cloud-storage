from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    DATABASE_URL: str
    
    UPLOAD_DIR: str = "./storage/uploads"
    MAX_FILE_SIZE: int = 104857600
    ALLOWED_EXTENSIONS: str
    
    BACKEND_CORS_ORIGINS: List[str] = []
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()