#!/bin/bash

# Security Verification Script used to test production build locally

echo "🔍 SVR: Security Verification Request - Admin Site"
echo "---------------------------------------------------"
echo "Target: http://localhost:3000/api/admin/reindex"
echo "Method: POST (Simulating attack)"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/admin/reindex)

if [ "$RESPONSE" == "401" ]; then
  echo "✅ PASS: Server responded with 401 Unauthorized."
  echo "   The API is protected against unauthenticated access."
else
  echo "❌ FAIL: Server responded with $RESPONSE (Expected 401)."
  echo "   Use 'npm stop' to kill the server if it is running."
fi
echo "---------------------------------------------------"
