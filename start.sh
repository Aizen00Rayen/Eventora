#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
#  Eventora – Local Dev Launcher (no Docker required)
#  Usage:  ./start.sh [--reset]
#
#  --reset   Wipe the SQLite database and re-seed (fresh start)
# ──────────────────────────────────────────────────────────────────────────────
set -e

RESET=false
for arg in "$@"; do
  [[ "$arg" == "--reset" ]] && RESET=true
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${CYAN}[Eventora]${NC} $*"; }
success() { echo -e "${GREEN}[✓]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
error()   { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ── 1. Python virtual environment ─────────────────────────────────────────────
info "Setting up Python environment..."
if ! command -v python3 &>/dev/null; then error "python3 not found. Please install Python 3.10+."; fi

if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
  success "Created virtualenv at $VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install -q --upgrade pip
pip install -q -r "$BACKEND_DIR/requirements.txt"
success "Python dependencies installed"

# ── 2. Environment variables ───────────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  warn "Created .env from .env.example — edit it if needed"
fi

# Load .env
set -a
source "$ROOT_DIR/.env" 2>/dev/null || true
set +a

# Override for local SQLite dev
export DB_ENGINE=sqlite
export EMAIL_MODE=console
export DEBUG=True
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ALLOWED_ORIGINS=http://localhost:3000

# ── 3. Database ────────────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

if $RESET && [ -f "db.sqlite3" ]; then
  info "Resetting database..."
  rm db.sqlite3
  success "Removed old database"
fi

info "Running migrations..."
python manage.py migrate --run-syncdb -v 0
success "Migrations complete"

if $RESET || [ ! -f "db.sqlite3" ] || [ "$(python manage.py shell -c 'from accounts.models import User; print(User.objects.count())' 2>/dev/null)" = "0" ]; then
  info "Seeding sample data..."
  python manage.py seed_data -v 0 2>/dev/null || warn "seed_data command not available or failed (safe to ignore)"
fi

# ── 4. Frontend dependencies ───────────────────────────────────────────────────
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  info "Installing frontend dependencies (first run — may take a minute)..."
  npm install --legacy-peer-deps --silent
  success "npm packages installed"
else
  info "node_modules found, skipping npm install"
fi

# ── 5. Create frontend .env if needed ─────────────────────────────────────────
if [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo "REACT_APP_API_URL=http://localhost:8000" > "$FRONTEND_DIR/.env"
  success "Created frontend .env"
fi

# ── 6. Launch servers ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Eventora is starting!${NC}"
echo -e "${GREEN}  Backend  →  http://localhost:8000${NC}"
echo -e "${GREEN}  Frontend →  http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop both servers"
echo ""

# Start backend in background, save its PID
cd "$BACKEND_DIR"
source "$VENV_DIR/bin/activate"
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend in foreground
cd "$FRONTEND_DIR"
BROWSER=none npm start &
FRONTEND_PID=$!

# ── 7. Trap Ctrl+C to kill both ────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  # Kill any child processes
  pkill -P $BACKEND_PID 2>/dev/null || true
  pkill -P $FRONTEND_PID 2>/dev/null || true
  success "Stopped. Goodbye!"
  exit 0
}
trap cleanup INT TERM

# Wait for both to finish
wait $BACKEND_PID $FRONTEND_PID
