#!/usr/bin/env bash
# Copies the web app (everything at the repository root except tooling folders)
# into the Android assets folder, where the WebView loads it from.
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
dest="$root/android/app/src/main/assets/www"
rm -rf "$dest"
mkdir -p "$dest"
rsync -a \
  --exclude '.git' --exclude '.github' --exclude '.hallmark' --exclude 'android' \
  --exclude 'tools' --exclude 'node_modules' --exclude '*.md' --exclude '.gitignore' --exclude 'public' --exclude 'firebase.json' --exclude '.firebase' \
  "$root/" "$dest/"
echo "Copied web app into $dest:"
find "$dest" -type f | wc -l
