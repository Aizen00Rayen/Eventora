@echo off
setlocal enabledelayedexpansion

:: ──────────────────────────────────────────────────────────────────────────────
::  Eventora – Local Dev Launcher for Windows (no Docker required)
::  Usage:  start.bat [--reset]
::
::  --reset   Wipe the SQLite database and re-seed (fresh start)
:: ──────────────────────────────────────────────────────────────────────────────

set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend
set VENV_DIR=%BACKEND_DIR%\.venv

set RESET=false
if "%1"=="--reset" set RESET=true

:: ── 1. Check Python ───────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [!] Python not found. Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: ── 2. Check Node / npm ───────────────────────────────────────────────────────
npm --version >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: ── 3. Python virtual environment ─────────────────────────────────────────────
echo [Eventora] Setting up Python environment...
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    python -m venv "%VENV_DIR%"
    echo [OK] Created virtualenv
)

call "%VENV_DIR%\Scripts\activate.bat"
python -m pip install -q --upgrade pip
pip install -q -r "%BACKEND_DIR%\requirements.txt"
echo [OK] Python dependencies installed

:: ── 4. Copy .env if missing ───────────────────────────────────────────────────
if not exist "%ROOT_DIR%.env" (
    copy "%ROOT_DIR%.env.example" "%ROOT_DIR%.env" >nul
    echo [!] Created .env from .env.example
)

:: ── 5. Set local dev environment variables ────────────────────────────────────
set DB_ENGINE=sqlite
set EMAIL_MODE=console
set DEBUG=True
set ALLOWED_HOSTS=localhost,127.0.0.1
set CORS_ALLOWED_ORIGINS=http://localhost:3000

:: ── 6. Database ───────────────────────────────────────────────────────────────
cd /d "%BACKEND_DIR%"

if "%RESET%"=="true" (
    if exist "db.sqlite3" (
        del "db.sqlite3"
        echo [OK] Removed old database
    )
)

echo [Eventora] Running migrations...
python manage.py migrate --run-syncdb -v 0
echo [OK] Migrations complete

echo [Eventora] Seeding sample data...
python manage.py seed_data -v 0 2>nul
echo [OK] Done

:: ── 7. Frontend dependencies ──────────────────────────────────────────────────
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo [Eventora] Installing frontend dependencies (first run - may take a minute^)...
    npm install --legacy-peer-deps --silent
    echo [OK] npm packages installed
) else (
    echo [Eventora] node_modules found, skipping npm install
)

if not exist "%FRONTEND_DIR%\.env" (
    echo REACT_APP_API_URL=http://localhost:8000 > "%FRONTEND_DIR%\.env"
    echo [OK] Created frontend .env
)

:: ── 8. Launch both servers in separate windows ────────────────────────────────
echo.
echo ============================================================
echo   Eventora is starting!
echo   Backend  --^>  http://localhost:8000
echo   Frontend --^>  http://localhost:3000
echo ============================================================
echo.
echo   Two windows will open. Close them to stop the servers.
echo.

start "Eventora Backend" cmd /k "cd /d "%BACKEND_DIR%" && call "%VENV_DIR%\Scripts\activate.bat" && set DB_ENGINE=sqlite&& set EMAIL_MODE=console&& set DEBUG=True&& set ALLOWED_HOSTS=localhost,127.0.0.1&& set CORS_ALLOWED_ORIGINS=http://localhost:3000&& python manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak >nul

start "Eventora Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && set BROWSER=none&& npm start"

echo [OK] Both servers launched.
echo.
echo   Backend window  : "Eventora Backend"
echo   Frontend window : "Eventora Frontend"
echo.
pause
