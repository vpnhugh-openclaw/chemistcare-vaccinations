#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Install from https://nodejs.org"
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker Desktop for Mac."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found. Install with: brew install supabase/tap/supabase"
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

echo "Installing dependencies (if needed)..."
npm install

echo "Bootstrapping local backend..."
npm run local:bootstrap

echo "Starting ChemistCare local app..."
open http://localhost:5173 || true
npm run local:dev
