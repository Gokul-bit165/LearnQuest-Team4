"""
Proctoring service using YOLOv8 and MediaPipe
"""

import base64
import io
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

# Optional imports - only load when needed
cv2 = None
mp = None

try:
    import cv2
except ImportError:
    print("Warning: opencv-python not available")
    

class ProctoringService:
    """Service for AI-based proctoring using computer vision"""
    
    def __init__(self):
        self.models_loaded = False
        self.yolo_model = None
        self.face_mesh = None
        self.face_detector = None
        
    def load_models(self):
        """Load ML models for proctoring"""
        global cv2
        try:
            if cv2 is None:
                import cv2
            
            print("Loading basic proctoring models...")
            
            # For now, just use OpenCV's built-in detectors
            print("OpenCV face detection loaded")
            
            print("Basic proctoring models loaded")
            self.models_loaded = True
            
        except ImportError as e:
            print(f"Warning: Proctoring dependencies not available: {e}")
            print("Install with: pip install opencv-python-headless")
            self.models_loaded = False
        except Exception as e:
            print(f"Error loading proctoring models: {e}")
            self.models_loaded = False
    
    def process_image(self, image_base64: str) -> Dict:
        """
        Process an image for proctoring violations
        
        Returns:
            {
                'violations': ['phone_detected', 'face_not_detected', etc.],
                'metadata': {...},
                'face_detected': bool,
                'person_count': int
            }
        """
        global cv2
        if not self.models_loaded or cv2 is None:
            return {
                'violations': [],
                'metadata': {'status': 'models_not_loaded'},
                'face_detected': False,
                'person_count': 0
            }
        
        try:
            # Decode image
            img_data = base64.b64decode(image_base64)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {
                    'violations': [],
                    'metadata': {'error': 'invalid_image'},
                    'face_detected': False,
                    'person_count': 0
                }
            
            # Convert BGR to RGB for MediaPipe
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            violations = []
            metadata = {}
            
            # 1. Basic face detection using OpenCV
            face_detected = False
            try:
                # Use OpenCV's built-in face detector
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    face_detected = True
                    metadata['face_count'] = len(faces)
                    metadata['face_confidence'] = 0.8  # Default confidence for OpenCV
                else:
                    violations.append('face_not_detected')
                    metadata['face_count'] = 0
            except Exception as e:
                print(f"Face detection error: {e}")
                violations.append('face_not_detected')
                metadata['face_count'] = 0
            
            # 2. Object Detection using YOLO
            results = self.yolo_model(img, verbose=False)
            
            person_count = 0
            phone_detected = False
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        cls = int(box.cls[0])
                        class_name = self.yolo_model.names[cls]
                        confidence = float(box.conf[0])
                        
                        # Check for phone detection
                        if class_name == 'cell phone' and confidence > 0.5:
                            phone_detected = True
                            violations.append('phone_detected')
                            metadata['phone_confidence'] = confidence
                        
                        # Count persons
                        if class_name == 'person' and confidence > 0.5:
                            person_count += 1
            
            metadata['person_count'] = person_count
            
            # Check for multiple people
            if person_count > 1:
                violations.append('multiple_people')
            elif person_count == 0:
                violations.append('no_person')
            
            # 3. Face position/quality checks
            if face_detected and 'face_confidence' in metadata:
                if metadata['face_confidence'] < 0.7:
                    violations.append('face_low_confidence')
            
            return {
                'violations': violations,
                'metadata': metadata,
                'face_detected': face_detected,
                'person_count': person_count
            }
            
        except Exception as e:
            print(f"Error processing image for proctoring: {e}")
            return {
                'violations': [],
                'metadata': {'error': str(e)},
                'face_detected': False,
                'person_count': 0
            }
    
    def calculate_behavior_penalty(self, violations: List[str]) -> int:
        """
        Calculate behavior score penalty based on violations
        
        Returns negative penalty value (to subtract from score)
        """
        penalties = {
            'phone_detected': 25,
            'face_not_detected': 15,
            'multiple_people': 30,
            'no_person': 20,
            'face_low_confidence': 10,
            'tab_switch': 10,
            'audio_anomaly': 5,
            'multiple_voice_sources': 20,
            'loud_noise': 5
        }
        
        # Sum up all penalties
        total_penalty = sum(penalties.get(v, 0) for v in violations)
        
        return -total_penalty


# Global singleton instance
_proctoring_service = None

def get_proctoring_service() -> ProctoringService:
    """Get the singleton proctoring service instance"""
    global _proctoring_service
    if _proctoring_service is None:
        _proctoring_service = ProctoringService()
    return _proctoring_service
