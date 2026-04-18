"""
Eventora local launcher for Windows.
Called by start.bat — do not run directly unless Python is already on PATH.

Usage (via start.bat):
    start.bat           normal launch
    start.bat --reset   wipe SQLite DB and re-seed fresh data
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

RESET = "--reset" in sys.argv

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
VENV = BACKEND / ".venv"
ACTIVATE = VENV / "Scripts" / "activate.bat"
PYTHON = VENV / "Scripts" / "python.exe"
PIP = VENV / "Scripts" / "pip.exe"


def banner(msg):
    print(f"\n[Eventora] {msg}")


def ok(msg):
    print(f"[OK] {msg}")


def warn(msg):
    print(f"[!]  {msg}")


def die(msg):
    print(f"\n[ERROR] {msg}")
    input("\nPress Enter to exit...")
    sys.exit(1)


# ── 1. Check prerequisites ─────────────────────────────────────────────────────
if not shutil.which("python"):
    die("Python not found. Install Python 3.10+ from https://python.org (tick 'Add to PATH')")

if not shutil.which("npm"):
    die("Node.js not found. Install Node.js 18+ from https://nodejs.org")

# ── 2. Virtual environment ─────────────────────────────────────────────────────
banner("Setting up Python virtual environment...")
if not ACTIVATE.exists():
    subprocess.run([sys.executable, "-m", "venv", str(VENV)], check=True)
    ok("Created virtualenv")

subprocess.run([str(PIP), "install", "-q", "--upgrade", "pip"], check=True)
subprocess.run([str(PIP), "install", "-q", "-r", str(BACKEND / "requirements.txt")], check=True)
ok("Python dependencies installed")

# ── 3. .env file ───────────────────────────────────────────────────────────────
env_file = ROOT / ".env"
env_example = ROOT / ".env.example"
if not env_file.exists() and env_example.exists():
    shutil.copy(env_example, env_file)
    warn("Created .env from .env.example")

# ── 4. Database ────────────────────────────────────────────────────────────────
db_file = BACKEND / "db.sqlite3"
if RESET and db_file.exists():
    db_file.unlink()
    ok("Removed old database")

env = {
    **os.environ,
    "DB_ENGINE": "sqlite",
    "EMAIL_MODE": "console",
    "DEBUG": "True",
    "ALLOWED_HOSTS": "localhost,127.0.0.1",
    "CORS_ALLOWED_ORIGINS": "http://localhost:3000",
}

banner("Running migrations...")
result = subprocess.run(
    [str(PYTHON), "manage.py", "migrate", "--run-syncdb", "-v", "0"],
    cwd=BACKEND, env=env
)
if result.returncode != 0:
    die("Migrations failed. Check the output above.")
ok("Migrations complete")

banner("Seeding sample data...")
subprocess.run(
    [str(PYTHON), "manage.py", "seed_data", "-v", "0"],
    cwd=BACKEND, env=env
)

# ── 5. Frontend dependencies ───────────────────────────────────────────────────
banner("Checking frontend dependencies...")
if not (FRONTEND / "node_modules").exists():
    banner("Installing npm packages (first run — may take a minute)...")
    subprocess.run(["npm", "install", "--legacy-peer-deps", "--silent"], cwd=FRONTEND, check=True)
    ok("npm packages installed")
else:
    ok("node_modules found, skipping install")

fe_env_file = FRONTEND / ".env"
if not fe_env_file.exists():
    fe_env_file.write_text("REACT_APP_API_URL=http://localhost:8000\n")
    ok("Created frontend .env")

# ── 6. Launch servers ──────────────────────────────────────────────────────────
print()
print("=" * 60)
print("  Eventora is starting!")
print("  Backend  -->  http://localhost:8000")
print("  Frontend -->  http://localhost:3000")
print("=" * 60)
print()
print("  Two windows will open. Close them to stop the servers.")
print()

# Write helper scripts to TEMP to avoid CMD quoting issues
temp = Path(os.environ.get("TEMP", os.environ.get("TMP", "C:\\Temp")))

backend_helper = temp / "eventora_backend.bat"
backend_helper.write_text(
    "@echo off\r\n"
    "title Eventora Backend\r\n"
    f"cd /d \"{BACKEND}\"\r\n"
    f"call \"{ACTIVATE}\"\r\n"
    "set DB_ENGINE=sqlite\r\n"
    "set EMAIL_MODE=console\r\n"
    "set DEBUG=True\r\n"
    "set ALLOWED_HOSTS=localhost,127.0.0.1\r\n"
    "set CORS_ALLOWED_ORIGINS=http://localhost:3000\r\n"
    "echo [Backend] Django running at http://localhost:8000\r\n"
    "python manage.py runserver 127.0.0.1:8000\r\n"
    "pause\r\n",
    encoding="ascii"
)

frontend_helper = temp / "eventora_frontend.bat"
frontend_helper.write_text(
    "@echo off\r\n"
    "title Eventora Frontend\r\n"
    f"cd /d \"{FRONTEND}\"\r\n"
    "set BROWSER=none\r\n"
    "echo [Frontend] React running at http://localhost:3000\r\n"
    "npm start\r\n"
    "pause\r\n",
    encoding="ascii"
)

subprocess.Popen(["cmd", "/c", "start", "Eventora Backend", str(backend_helper)], shell=False)

import time
time.sleep(3)

subprocess.Popen(["cmd", "/c", "start", "Eventora Frontend", str(frontend_helper)], shell=False)

print("[OK] Both servers launched in separate windows.")
print()
input("Press Enter to close this window...")
