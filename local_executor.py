import subprocess
import tempfile
import os
import sys
from typing import Dict, Any

def execute_python_code(code: str, stdin_input: str = "") -> Dict[str, Any]:
    """
    Execute Python code locally (for development/testing purposes)
    This is NOT secure for production use!
    """
    try:
        # Create a temporary file for the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Execute the code with input
            result = subprocess.run(
                [sys.executable, temp_file],
                input=stdin_input,
                capture_output=True,
                text=True,
                timeout=10  # 10 second timeout
            )
            
            return {
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip() if result.stderr else None,
                "return_code": result.returncode,
                "success": result.returncode == 0
            }
        finally:
            # Clean up the temporary file
            os.unlink(temp_file)
            
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution timeout (10 seconds)",
            "return_code": -1,
            "success": False
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Execution error: {str(e)}",
            "return_code": -1,
            "success": False
        }

# Test the function
if __name__ == "__main__":
    test_code = """def sum_two_numbers(a, b):
    return a + b

if __name__ == "__main__":
    import sys
    line = sys.stdin.read().strip()
    if line:
        parts = line.split()
        if len(parts) >= 2:
            a, b = int(parts[0]), int(parts[1])
            result = sum_two_numbers(a, b)
            print(result)"""
    
    result = execute_python_code(test_code, "5 3")
    print("Test Result:")
    print(f"  stdout: '{result['stdout']}'")
    print(f"  stderr: '{result['stderr']}'")
    print(f"  success: {result['success']}")

