from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from database.session import engine
from .models import user, file as file_model
from .api import auth, files, search    # Import routers
import os

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)  

app = FastAPI(title=settings.APP_NAME)

origins = [
    "http://localhost:5173",      # Vite (Localhost)
    "http://127.0.0.1:5173",      # Vite (IP)
    "http://localhost:3000",      # React standard (just in case)
]

if hasattr(settings, "BACKEND_CORS_ORIGINS") and isinstance(settings.BACKEND_CORS_ORIGINS, list):
    origins.extend(settings.BACKEND_CORS_ORIGINS)

    

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# @app.middleware("http")
# async def debug_cors(request, call_next):
#     print(f"Request: {request.method} {request.url}")
#     print(f"Origin: {request.headers.get('origin')}")
#     response = await call_next(request)
#     print(f"Response status: {response.status_code}")
#     return response

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(search.router, prefix="/api")

@app.on_event("startup")
async def startup():
    # Create tables
    async with engine.begin() as conn:
        from database.base import Base
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "AI Cloud Storage API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}