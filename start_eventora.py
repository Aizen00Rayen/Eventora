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

# On Windows, npm is a .cmd script — resolve its full path so subprocess
# can call it without shell=True.
NPM = shutil.which("npm") or "npm"

PY_MIN = (3, 10)
PY_MAX = (3, 15)   # exclusive upper bound; update when Django adds support


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


# ── 1. Check prerequisites ──────────────────────────────────────────────────
py_ver = sys.version_info[:2]
if py_ver < PY_MIN:
    die(
        f"Python {py_ver[0]}.{py_ver[1]} is too old.\n"
        f"Eventora requires Python 3.10 or newer.\n"
        f"Download: https://python.org/downloads/"
    )
if py_ver >= PY_MAX:
    warn(
        f"Python {py_ver[0]}.{py_ver[1]} is very new and may not yet have\n"
        f"     pre-built wheels for all dependencies. Installation will attempt\n"
        f"     to build from source where needed (this is normal)."
    )

if not shutil.which("python"):
    die("Python not found on PATH. Install Python 3.10+ from https://python.org (tick 'Add to PATH')")

if not shutil.which("npm"):
    die("Node.js / npm not found. Install Node.js 18+ from https://nodejs.org and restart this window.")

# ── 2. Virtual environment ───────────────────────────────────────────────────
banner("Setting up Python virtual environment...")
if not ACTIVATE.exists():
    subprocess.run([sys.executable, "-m", "venv", str(VENV)], check=True)
    ok("Created virtualenv")

subprocess.run(
    [str(PYTHON), "-m", "pip", "install", "-q", "--upgrade", "pip"],
    check=True,
)

# --prefer-binary: use wheels when available, fall back to source builds
# (unlike --only-binary :all: which fails if no wheel exists for your Python version)
banner("Installing Python dependencies...")
result = subprocess.run(
    [str(PYTHON), "-m", "pip", "install", "-q", "--prefer-binary",
     "-r", str(BACKEND / "requirements.txt")],
)
if result.returncode != 0:
    # Retry without binary preference — lets pip build from source
    warn("Wheel install failed; retrying with source builds allowed...")
    result = subprocess.run(
        [str(PYTHON), "-m", "pip", "install", "-q",
         "-r", str(BACKEND / "requirements.txt")],
    )
    if result.returncode != 0:
        die(
            "A Python dependency failed to install.\n\n"
            "Common fixes:\n"
            "  1. Make sure Microsoft C++ Build Tools are installed:\n"
            "     https://visualstudio.microsoft.com/visual-cpp-build-tools/\n"
            "     (needed to compile packages that have no wheel for your Python version)\n"
            "  2. Delete backend\\.venv and run start.bat again.\n"
            "  3. Try Python 3.11, 3.12, or 3.13 where more wheels are available:\n"
            "     https://python.org/downloads/"
        )
ok("Python dependencies installed")

# ── 3. .env file ────────────────────────────────────────────────────────────
env_file = ROOT / ".env"
env_example = ROOT / ".env.example"
if not env_file.exists() and env_example.exists():
    shutil.copy(env_example, env_file)
    warn("Created .env from .env.example")

# ── 4. Database ──────────────────────────────────────────────────────────────
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
    cwd=BACKEND, env=env,
)
if result.returncode != 0:
    die("Migrations failed. Check the output above.")
ok("Migrations complete")

banner("Seeding sample data...")
subprocess.run(
    [str(PYTHON), "manage.py", "seed_data", "-v", "0"],
    cwd=BACKEND, env=env,
)

# ── 5. Frontend dependencies ─────────────────────────────────────────────────
import hashlib as _hashlib

banner("Checking frontend dependencies...")

_pkg_json = FRONTEND / "package.json"
_stamp_file = FRONTEND / "node_modules" / ".install_stamp"


def _pkg_hash():
    return _hashlib.md5(_pkg_json.read_bytes()).hexdigest()


_needs_install = not (FRONTEND / "node_modules").exists()
if not _needs_install and _stamp_file.exists():
    _needs_install = _stamp_file.read_text().strip() != _pkg_hash()
elif not _needs_install:
    _needs_install = True  # stamp missing — reinstall once to be safe

if _needs_install:
    banner("Installing npm packages (may take a minute on first run)...")
    result = subprocess.run(
        [NPM, "install", "--legacy-peer-deps", "--silent"],
        cwd=FRONTEND,
    )
    if result.returncode != 0:
        die("npm install failed. Check the output above.")
    _stamp_file.write_text(_pkg_hash())
    ok("npm packages installed")
else:
    ok("node_modules up to date, skipping npm install")

fe_env_file = FRONTEND / ".env"
if not fe_env_file.exists():
    fe_env_file.write_text("VITE_API_URL=http://localhost:8000\n")
    ok("Created frontend .env")

# ── 6. Launch servers ────────────────────────────────────────────────────────
print()
print("=" * 60)
print("  Eventora is starting!")
print("  Backend  -->  http://localhost:8000")
print("  Frontend -->  http://localhost:3000")
print("=" * 60)
print()
print("  Two windows will open. Close them to stop the servers.")
print()

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
    encoding="ascii",
)

frontend_helper = temp / "eventora_frontend.bat"
frontend_helper.write_text(
    "@echo off\r\n"
    "title Eventora Frontend\r\n"
    f"cd /d \"{FRONTEND}\"\r\n"
    "echo [Frontend] Vite dev server starting at http://localhost:3000\r\n"
    "npm start\r\n"
    "pause\r\n",
    encoding="ascii",
)

subprocess.Popen(["cmd", "/c", "start", "Eventora Backend", str(backend_helper)], shell=False)

import time
time.sleep(3)

subprocess.Popen(["cmd", "/c", "start", "Eventora Frontend", str(frontend_helper)], shell=False)

print("[OK] Both servers launched in separate windows.")
print()
input("Press Enter to close this window...")
