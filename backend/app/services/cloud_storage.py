import boto3
from botocore.exceptions import ClientError
from ..core.config import settings
import os

class CloudStorageService:
    def __init__(self):
        if settings.USE_CLOUD_STORAGE:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name='auto'
            )
            self.bucket_name = settings.R2_BUCKET_NAME
            self.use_cloud = True
            print("✓ Cloud storage (R2) initialized")
        else:
            self.use_cloud = False
            print("✓ Using local storage")
    
    def upload_file(self, file_path: str, object_key: str) -> str:
        """Upload file to R2 and return public URL"""
        if not self.use_cloud:
            return file_path
        
        try:
            # Upload to R2
            with open(file_path, 'rb') as file_data:
                self.s3_client.upload_fileobj(
                    file_data,
                    self.bucket_name,
                    object_key,
                    ExtraArgs={'ContentType': self._get_content_type(file_path)}
                )
            
            # Generate public URL
            public_url = f"{settings.R2_PUBLIC_URL}/{object_key}"
            
            # # Delete local file after upload (optional)
            # if os.path.exists(file_path):
            #     os.remove(file_path)
            
            print(f"✓ Uploaded to cloud: {object_key}")
            return public_url
            
        except ClientError as e:
            print(f"✗ Cloud upload failed: {e}")
            return file_path  # Fallback to local
    
    def download_file(self, object_key: str, download_path: str) -> str:
        """Download file from R2 to local path"""
        if not self.use_cloud:
            return download_path
        
        try:
            os.makedirs(os.path.dirname(download_path), exist_ok=True)
            
            self.s3_client.download_file(
                self.bucket_name,
                object_key,
                download_path
            )
            
            print(f"✓ Downloaded from cloud: {object_key}")
            return download_path
            
        except ClientError as e:
            print(f"✗ Cloud download failed: {e}")
            return None
    
    def delete_file(self, object_key: str) -> bool:
        """Delete file from R2"""
        if not self.use_cloud:
            return True
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            print(f"✓ Deleted from cloud: {object_key}")
            return True
            
        except ClientError as e:
            print(f"✗ Cloud delete failed: {e}")
            return False
    
    def get_file_url(self, object_key: str) -> str:
        """Get public URL for a file"""
        if not self.use_cloud:
            return object_key
        
        return f"{settings.R2_PUBLIC_URL}/{object_key}"
    
    def _get_content_type(self, file_path: str) -> str:
        """Get content type based on file extension"""
        ext = os.path.splitext(file_path)[1].lower()
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.zip': 'application/zip',
        }
        return content_types.get(ext, 'application/octet-stream')

# Global instance
cloud_storage = CloudStorageService()