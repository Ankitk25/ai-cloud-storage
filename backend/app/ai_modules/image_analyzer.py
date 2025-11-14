import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io

class ImageAnalyzer:
    def __init__(self):
        print("Loading CLIP model for image analysis...")
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        # Predefined categories for classification
        self.categories = [
            "document", "photo", "screenshot", "diagram", "chart",
            "nature", "people", "animal", "food", "vehicle",
            "building", "indoor", "outdoor", "art", "text"
        ]
        
        # Common tags to detect
        self.tag_options = [
            "sunset", "beach", "mountain", "city", "forest",
            "cat", "dog", "bird", "person", "group of people",
            "car", "building", "food", "selfie", "landscape",
            "portrait", "document", "whiteboard", "graph", "table"
        ]
    
    def analyze_image(self, image_path):
        """Analyze image and return tags and category"""
        try:
            image = Image.open(image_path).convert("RGB")
            
            # Get tags
            tags = self._generate_tags(image)
            
            # Get category
            category = self._classify_image(image)
            
            return {
                "tags": tags,
                "category": category,
                "success": True
            }
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return {
                "tags": [],
                "category": "unknown",
                "success": False,
                "error": str(e)
            }
    
    def _generate_tags(self, image, top_k=5):
        """Generate relevant tags for the image"""
        inputs = self.processor(
            text=self.tag_options,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Get top k predictions
        top_probs, top_indices = torch.topk(probs[0], min(top_k, len(self.tag_options)))
        
        # Filter tags with confidence > 0.1
        tags = []
        for prob, idx in zip(top_probs, top_indices):
            if prob > 0.1:
                tags.append(self.tag_options[idx])
        
        return tags
    
    def _classify_image(self, image):
        """Classify image into a category"""
        inputs = self.processor(
            text=self.categories,
            images=image,
            return_tensors="pt",
            padding=True
        )
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        category_idx = probs.argmax().item()
        return self.categories[category_idx]

# Global instance
_image_analyzer = None

def get_image_analyzer():
    global _image_analyzer
    if _image_analyzer is None:
        _image_analyzer = ImageAnalyzer()
    return _image_analyzer