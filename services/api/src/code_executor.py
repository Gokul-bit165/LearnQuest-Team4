import subprocess
import tempfile
import os
import sys
from typing import Dict, Any, Optional

class CodeExecutor:
    """Code execution service with Judge0 fallback to local execution"""
    
    @staticmethod
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
                    "compile_output": None,
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
                "compile_output": None,
                "return_code": -1,
                "success": False
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Execution error: {str(e)}",
                "compile_output": None,
                "return_code": -1,
                "success": False
            }
    
    @staticmethod
    def execute_javascript_code(code: str, stdin_input: str = "") -> Dict[str, Any]:
        """Execute JavaScript code using Node.js"""
        try:
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                # Execute the code with input
                result = subprocess.run(
                    ["node", temp_file],
                    input=stdin_input,
                    capture_output=True,
                    text=True,
                    timeout=10  # 10 second timeout
                )
                
                return {
                    "stdout": result.stdout.strip(),
                    "stderr": result.stderr.strip() if result.stderr else None,
                    "compile_output": None,
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
                "compile_output": None,
                "return_code": -1,
                "success": False
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Execution error: {str(e)}",
                "compile_output": None,
                "return_code": -1,
                "success": False
            }
    
    @staticmethod
    def execute_code(code: str, language_id: int, stdin_input: str = "") -> Dict[str, Any]:
        """
        Execute code based on language_id
        Language IDs: 71=Python, 63=JavaScript
        """
        if language_id == 71:  # Python
            return CodeExecutor.execute_python_code(code, stdin_input)
        elif language_id == 63:  # JavaScript
            return CodeExecutor.execute_javascript_code(code, stdin_input)
        else:
            return {
                "stdout": "",
                "stderr": f"Unsupported language ID: {language_id}",
                "compile_output": None,
                "return_code": -1,
                "success": False
            }

