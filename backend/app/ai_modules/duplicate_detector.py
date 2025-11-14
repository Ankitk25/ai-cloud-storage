import imagehash
from PIL import Image
import os

class DuplicateDetector:
    
    @staticmethod
    def calculate_image_hash(image_path):
        """Calculate perceptual hash of an image"""
        try:
            image = Image.open(image_path)
            # Using average hash for duplicate detection
            ahash = imagehash.average_hash(image)
            # Using perceptual hash for similar images
            phash = imagehash.phash(image)
            
            return {
                "average_hash": str(ahash),
                "perceptual_hash": str(phash),
                "success": True
            }
        except Exception as e:
            return {
                "average_hash": None,
                "perceptual_hash": None,
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def are_images_similar(hash1, hash2, threshold=5):
        """Check if two image hashes are similar"""
        try:
            h1 = imagehash.hex_to_hash(hash1)
            h2 = imagehash.hex_to_hash(hash2)
            difference = h1 - h2
            return difference <= threshold
        except:
            return False
    
    @staticmethod
    def calculate_file_hash(file_path):
        """Calculate hash for any file type"""
        import hashlib
        try:
            hasher = hashlib.md5()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            return {
                "hash": hasher.hexdigest(),
                "success": True
            }
        except Exception as e:
            return {
                "hash": None,
                "success": False,
                "error": str(e)
            }