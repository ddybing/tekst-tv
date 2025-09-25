#!/bin/sh

ARCHIVE_DIR="/archive-data" # Directory inside the container where archive will be stored
INDEX_OUTPUT_DIR="/app/app/public" # Where index.json should be generated

echo "Starting archive updater..."
echo "Archive Repo URL: $ARCHIVE_REPO_URL"
echo "Update Interval: $UPDATE_INTERVAL_SECONDS seconds"

# Ensure the index output directory exists
mkdir -p "$INDEX_OUTPUT_DIR"

# Initial clone
if [ ! -d "$ARCHIVE_DIR/.git" ]; then
  echo "Cloning initial archive from $ARCHIVE_REPO_URL to $ARCHIVE_DIR..."
  git clone "$ARCHIVE_REPO_URL" "$ARCHIVE_DIR"
  if [ $? -ne 0 ]; then
    echo "Error: Initial git clone failed. Exiting."
    exit 1
  fi
else
  echo "Archive directory already exists. Skipping initial clone."
fi

while true; do
  echo "Updating archive at $(date)..."
  cd "$ARCHIVE_DIR" || { echo "Error: Cannot change directory to $ARCHIVE_DIR. Exiting."; exit 1; }
  git pull origin main # Assuming 'main' branch, adjust if needed
  if [ $? -ne 0 ]; then
    echo "Warning: git pull failed. Continuing with existing archive."
  fi
  cd - > /dev/null # Go back to previous directory

  echo "Generating archive index..."
  node ./scripts/generate-archive-index.js "$ARCHIVE_DIR" "$INDEX_OUTPUT_DIR"
  if [ $? -ne 0 ]; then
    echo "Error: generate-archive-index.js failed. Exiting."
    exit 1
  fi

  echo "Archive update complete. Sleeping for $UPDATE_INTERVAL_SECONDS seconds."
  sleep "$UPDATE_INTERVAL_SECONDS"
done
