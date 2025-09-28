#!/bin/sh

ARCHIVE_DIR="/archive-data" # Directory inside the container where archive will be stored
INDEX_OUTPUT_DIR="/archive-data/index.json" # Where index.json should be generated

echo "Starting archive updater..."
echo "Archive Repo URL: $ARCHIVE_REPO_URL"
echo "Update Interval: $UPDATE_INTERVAL_SECONDS seconds"


# Initial clone
if [ ! -d "$ARCHIVE_DIR/.git" ]; then
  echo "Listing contents of /archive-data before clone:"
  ls -la /archive-data
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
  last_pulled=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "Updating archive at $last_pulled..."

  cd "$ARCHIVE_DIR" || { echo "Error: Cannot change directory to $ARCHIVE_DIR. Exiting."; exit 1; }
  git pull origin main # Assuming 'main' branch, adjust if needed
  if [ $? -ne 0 ]; then
    echo "Warning: git pull failed. Continuing with existing archive."
  fi
  latest_page_update=$(git log -1 --format=%cd --date=iso-strict)
  cd - > /dev/null # Go back to previous directory

  echo "Generating archive index..."
  node ./scripts/generate-archive-index.js "$ARCHIVE_DIR" "$INDEX_OUTPUT_DIR"
  if [ $? -ne 0 ]; then
    echo "Error: generate-archive-index.js failed. Exiting."
    exit 1
  fi

  echo "Generating status file..."
  echo "{\"lastPulled\":\"$last_pulled\",\"latestPageUpdate\":\"$latest_page_update\"}" > "$ARCHIVE_DIR/status.json"

  echo "Archive update complete. Sleeping for $UPDATE_INTERVAL_SECONDS seconds."
  sleep "$UPDATE_INTERVAL_SECONDS"
done
