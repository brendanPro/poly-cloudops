#!/bin/sh

echo "Waiting for n8n..."
sleep 10

echo "Creating DeepL credential (if not exists)..."

n8n credentials:create \
  --name "DeepL account" \
  --type deepLApi \
  --data "{\"apiKey\":\"$DEEPL_API_KEY\"}" || true

echo "Importing workflow..."

n8n import:workflow \
  --input=/home/node/.n8n/workflows/translate-text-deepl.json \
  --overwrite
