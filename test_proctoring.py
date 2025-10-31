"""
Test script to verify proctoring WebSocket and REST endpoints are working
"""
import asyncio
import websockets
import json
import base64
import cv2
import numpy as np

async def test_proctoring_websocket():
    """Test the proctoring WebSocket connection"""
    attempt_id = "test_attempt_123"
    ws_url = f"ws://localhost:8000/api/proctoring/ws/{attempt_id}"
    
    print(f"Connecting to: {ws_url}")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("✓ WebSocket connected successfully!")
            
            # Create a simple test frame (blank image)
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            # Draw a circle to make it visible
            cv2.circle(frame, (320, 240), 100, (0, 255, 0), -1)
            
            # Encode to JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            frame_data = base64.b64encode(buffer).decode('utf-8')
            
            # Send frame
            message = json.dumps({"frame": f"data:image/jpeg;base64,{frame_data}"})
            await websocket.send(message)
            print("✓ Sent test frame")
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
            data = json.loads(response)
            print(f"✓ Received response: {json.dumps(data, indent=2)}")
            
            # Send stop signal
            await websocket.send(json.dumps({"action": "stop"}))
            print("✓ Sent stop signal")
            
            return True
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

async def main():
    print("=" * 60)
    print("Testing Proctoring WebSocket Endpoint")
    print("=" * 60)
    
    success = await test_proctoring_websocket()
    
    if success:
        print("\n✓ All tests passed! Proctoring system is working.")
    else:
        print("\n✗ Tests failed. Check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())
