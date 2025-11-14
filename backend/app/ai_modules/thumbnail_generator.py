from PIL import Image
import os

class ThumbnailGenerator:
    
    @staticmethod
    def create_thumbnail(image_path, output_path, size=(200, 200)):
        """Create a thumbnail for an image"""
        try:
            image = Image.open(image_path)
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Create thumbnail directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save as JPEG to reduce size
            if image.mode in ('RGBA', 'LA', 'P'):
                # Convert to RGB for JPEG
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            image.save(output_path, 'JPEG', quality=85, optimize=True)
            
            return {
                "success": True,
                "thumbnail_path": output_path,
                "thumbnail_size": os.path.getsize(output_path)
            }
        except Exception as e:
            print(f"Thumbnail generation error: {e}")
            return {
                "success": False,
                "error": str(e)
            }