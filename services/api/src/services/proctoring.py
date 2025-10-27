"""
Proctoring service using YOLOv8 and MediaPipe
"""

import base64
import io
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image
import cv2

class ProctoringService:
    """Service for AI-based proctoring using computer vision"""
    
    def __init__(self):
        self.models_loaded = False
        self.yolo_model = None
        self.face_mesh = None
        self.face_detector = None
        
    def load_models(self):
        """Load ML models for proctoring"""
        try:
            # Import here to avoid breaking if dependencies are not installed
            from ultralytics import YOLO
            import mediapipe as mp
            
            print("Loading proctoring models...")
            
            # Load YOLOv8 for object detection
            self.yolo_model = YOLO('yolov8n.pt')  # nano model for speed
            print("YOLOv8 model loaded")
            
            # Initialize MediaPipe face mesh and face detection
            mp_face_mesh = mp.solutions.face_mesh
            mp_face_detection = mp.solutions.face_detection
            mp_drawing = mp.solutions.drawing_utils
            
            self.face_mesh = mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            self.face_detector = mp_face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=0.5
            )
            
            print("MediaPipe models loaded")
            self.models_loaded = True
            
        except ImportError as e:
            print(f"Warning: Proctoring dependencies not available: {e}")
            print("Install with: pip install ultralytics mediapipe opencv-python-headless")
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
        if not self.models_loaded:
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
            
            # 1. Face Detection using MediaPipe
            face_detected = False
            face_results = self.face_detector.process(img_rgb)
            
            if face_results.detections and len(face_results.detections) > 0:
                face_detected = True
                metadata['face_confidence'] = face_results.detections[0].score[0]
                metadata['face_count'] = len(face_results.detections)
                
                # Detect landmarks for face presence quality
                landmarks = self.face_mesh.process(img_rgb)
                if landmarks.multi_face_landmarks:
                    metadata['landmarks_detected'] = True
            else:
                # No face detected
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
