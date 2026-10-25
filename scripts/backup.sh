#!/usr/bin/env bash
# IsroPR — Database & Audio Backup Script
# Usage: ./scripts/backup.sh [destination_directory]

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${1:-./backups}/backup_${TIMESTAMP}"
DATA_DIR="${DATA_DIR:-./data}"

echo "🚀 Starting IsroPR backup..."
echo "Source: $DATA_DIR"
echo "Destination: $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

# 1. Backup SQLite Database safely
if [ -f "$DATA_DIR/spacebharat.db" ]; then
  if command -v sqlite3 &> /dev/null; then
    sqlite3 "$DATA_DIR/spacebharat.db" ".backup '$BACKUP_DIR/spacebharat.db'"
  else
    cp "$DATA_DIR/spacebharat.db" "$BACKUP_DIR/spacebharat.db"
  fi
  echo "✓ Database backed up successfully"
fi

# 2. Backup Audio directory
if [ -d "$DATA_DIR/audio" ]; then
  mkdir -p "$BACKUP_DIR/audio"
  cp -r "$DATA_DIR/audio" "$BACKUP_DIR/"
  echo "✓ Audio directory backed up successfully"
fi

# 3. Create manifest
cat << EOF > "$BACKUP_DIR/manifest.txt"
IsroPR Backup Manifest
Timestamp: $TIMESTAMP
Date: $(date)
Included: isropr.db, audio/
To restore:
1. Stop the application server: npm stop or kill process
2. Copy $BACKUP_DIR/isropr.db into data/spacebharat.db
3. Copy $BACKUP_DIR/audio into data/audio
4. Restart the application: npm start
EOF

echo "✅ Backup complete at $BACKUP_DIR"
