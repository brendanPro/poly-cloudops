#!/bin/bash

# Script to set up n8n admin account via API
# Reads credentials from .env file

set -e

N8N_URL="http://localhost:5678"

# Load .env file
if [ -f ".env" ]; then
  export $(cat .env | grep -v '^#' | grep -v '^\s*$' | xargs)
else
  echo "[ERROR] .env file not found"
  exit 1
fi

if [ -z "$N8N_ADMIN_EMAIL" ] || [ -z "$N8N_ADMIN_PASSWORD" ]; then
  echo "[ERROR] N8N_ADMIN_EMAIL or N8N_ADMIN_PASSWORD not set in .env"
  exit 1
fi

echo ""
echo "======================================"
echo "N8N Admin Account Setup Script (Bash)"
echo "======================================"
echo ""
echo "Target: $N8N_URL"
echo "Email: $N8N_ADMIN_EMAIL"
echo ""

# Step 1: Wait for n8n
echo "[Step 1] Waiting for n8n to be ready..."

MAX_WAIT=120
ELAPSED=0
INTERVAL=3

while [ $ELAPSED -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" "$N8N_URL" | grep -q "200"; then
    echo "[OK] n8n is responding!"
    break
  fi

  echo -n "."
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo ""

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "[ERROR] n8n did not respond after $MAX_WAIT seconds"
  echo "Check:"
  echo "  docker ps"
  echo "  docker-compose logs n8n"
  exit 1
fi

# Step 2: Wait for full initialization
echo "[Step 2] Waiting for full initialization (20 seconds)..."
sleep 20

# Step 3: Try multiple endpoints to create owner
echo "[Step 3] Creating owner account..."

ENDPOINTS=("$N8N_URL/rest/owner" "$N8N_URL/rest/owner/setup")
ACCOUNT_CREATED=false
ACCOUNT_EXISTS=false

for SETUP_URL in "${ENDPOINTS[@]}"; do
  echo "  Trying: $SETUP_URL"
  
  SETUP_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$SETUP_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$N8N_ADMIN_EMAIL\",
      \"password\": \"$N8N_ADMIN_PASSWORD\",
      \"firstName\": \"CloudOps\",
      \"lastName\": \"Admin\"
    }")

  STATUS=$(echo "$SETUP_RESPONSE" | tail -n1)

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    echo "[OK] Admin account created successfully!"
    ACCOUNT_CREATED=true
    break
  elif [ "$STATUS" = "400" ]; then
    echo "  Account already exists"
    ACCOUNT_EXISTS=true
    break
  elif [ "$STATUS" = "404" ]; then
    echo "  Endpoint not found, trying next..."
  else
    echo "  Failed with status: $STATUS"
  fi
done

echo ""

# Step 4: Authenticate
if [ "$ACCOUNT_CREATED" = true ] || [ "$ACCOUNT_EXISTS" = true ]; then
  echo "[Step 4] Authenticating..."
  
  LOGIN_ENDPOINTS=("$N8N_URL/rest/login" "$N8N_URL/api/v1/login")
  AUTHENTICATED=false
  AUTH_TOKEN=""
  
  for LOGIN_URL in "${LOGIN_ENDPOINTS[@]}"; do
    echo "  Trying: $LOGIN_URL"
    
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X POST "$LOGIN_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$N8N_ADMIN_EMAIL\",
        \"password\": \"$N8N_ADMIN_PASSWORD\"
      }")

    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)
    LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n1)

    if [ "$LOGIN_STATUS" = "200" ]; then
      # Try to extract token using different possible paths
      AUTH_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"' || echo "")
      
      if [ -z "$AUTH_TOKEN" ]; then
        AUTH_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"id":"[^"]*' | cut -d':' -f2 | tr -d '"' || echo "")
      fi

      echo "[OK] Authentication successful!"
      AUTHENTICATED=true
      break
    elif [ "$LOGIN_STATUS" = "404" ]; then
      echo "  Endpoint not found, trying next..."
    else
      echo "  Failed with status: $LOGIN_STATUS"
    fi
  done

  echo ""
  
  # Step 5: Display results
  echo "======================================"
  echo "Setup Complete!"
  echo "======================================"
  echo ""
  echo "Account credentials:"
  echo "  Email: $N8N_ADMIN_EMAIL"
  echo "  Password: $N8N_ADMIN_PASSWORD"
  echo ""
  
  if [ "$AUTHENTICATED" = true ] && [ -n "$AUTH_TOKEN" ]; then
    echo "Authentication Token (for API calls):"
    echo "  $AUTH_TOKEN"
    echo ""
  fi
  
  echo "Access n8n at: $N8N_URL"
  echo ""
  
  if [ "$AUTHENTICATED" = true ]; then
    echo "Your browser should remember the session."
    echo "You won't need to login again unless you clear cookies."
  else
    echo "Please login with the credentials above."
  fi
  
  echo ""

  # Try opening browser (Linux/macOS)
  if command -v xdg-open >/dev/null; then
    xdg-open "$N8N_URL" 2>/dev/null
    echo "[OK] Browser opened!"
  elif command -v open >/dev/null; then
    open "$N8N_URL" 2>/dev/null
    echo "[OK] Browser opened!"
  else
    echo "Please open: $N8N_URL"
  fi
  
else
  echo "======================================"
  echo "Manual Setup Required"
  echo "======================================"
  echo ""
  echo "Could not create account automatically."
  echo "Please complete the setup manually at:"
  echo "  $N8N_URL"
  echo ""
  echo "Use these credentials:"
  echo "  Email: $N8N_ADMIN_EMAIL"
  echo "  Password: $N8N_ADMIN_PASSWORD"
  echo "  First Name: CloudOps"
  echo "  Last Name: Admin"
  echo ""
fi