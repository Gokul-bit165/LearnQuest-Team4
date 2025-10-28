@echo off
echo ======================================
echo LearnQuest Login Fix
echo ======================================
echo.

echo This script will:
echo 1. Check if MongoDB is running
echo 2. Fix user passwords in database
echo 3. Create test users if needed
echo.

pause

cd scripts
python diagnose_login_issues.py

echo.
echo ======================================
echo Login credentials:
echo.
echo Student: student@learnquest.com / pass123
echo Admin:   admin@learnquest.com / admin123
echo.
echo ======================================
echo.
pause

