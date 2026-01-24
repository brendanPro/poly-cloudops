#!/bin/bash
set -e

docker compose up -d

echo "Waiting for n8n..."
sleep 20

AUTH=$(echo -n "n8n-admin:strongpassword" | base64)

curl -X POST http://localhost:5678/rest/workflows \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/json" \
  --data-binary @./workflows/translate-text-deepl.json

echo "Bootstrap completed."
