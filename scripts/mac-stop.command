#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Stopping local Supabase containers..."
supabase stop || true

echo "Done."
read -n 1 -s -r -p "Press any key to close..."
