#!/bin/bash

# Quick API Test Script - Uses existing user
API_URL="http://localhost:3000"
USER_ID="c8190249-07bf-4a35-a58f-801f05f9f2e2"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

test_api() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "\n${BLUE}━━━ $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        FAIL=$((FAIL + 1))
    fi
    
    echo "$body" | jq '.' 2>/dev/null || echo "$body" | head -c 200
}

echo "╔═══════════════════════════════════════════════╗"
echo "║     CV BUILDER - QUICK API TEST               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Using User ID: $USER_ID"

# 1. Health Check
test_api "Health Check" "GET" "$API_URL/api/health"

# 2. Get All Users
test_api "Get All Users" "GET" "$API_URL/api/users"

# 3. Get User by ID
test_api "Get User by ID" "GET" "$API_URL/api/users/$USER_ID"

# 4. Get Components
test_api "Get Components" "GET" "$API_URL/api/components/$USER_ID"

# 5. Get Components by Type
test_api "Get Experience Components" "GET" "$API_URL/api/components/$USER_ID?type=experience"

# 6. Get Components by Source
test_api "Get GitHub Components" "GET" "$API_URL/api/components/$USER_ID?source=github"

# 7. Get Job Descriptions
test_api "Get Job Descriptions" "GET" "$API_URL/api/job-descriptions/$USER_ID"

# 8. Get Extracted JDs
test_api "Get Extracted JDs" "GET" "$API_URL/api/jd/extract?userId=$USER_ID"

# 9. Search Components
echo -e "\n${YELLOW}Note: Search requires SQL functions${NC}"
test_api "Search Components" "POST" "$API_URL/api/search/components" \
    "{\"userId\":\"$USER_ID\",\"query\":\"React developer\",\"limit\":5}"

# 10. CV Match Score
echo -e "\n${YELLOW}Note: Match requires SQL functions${NC}"
test_api "CV Match Score" "POST" "$API_URL/api/cv/match" \
    "{\"userId\":\"$USER_ID\",\"jobDescription\":\"Senior React Developer with Node.js\"}"

# 11. Preview CV Content
echo -e "\n${YELLOW}Note: This may take 10-30 seconds (LLM)${NC}"
test_api "Preview CV Content" "GET" \
    "$API_URL/api/cv/generate?userId=$USER_ID&jobDescription=Senior%20Developer"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║              TEST SUMMARY                     ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "Total: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed (likely missing SQL functions)${NC}"
    echo ""
    echo "To fix SQL function errors:"
    echo "  1. Open Supabase Dashboard → SQL Editor"
    echo "  2. Run: src/lib/supabase-functions.sql"
    echo "  3. Create storage bucket: cv_pdfs"
    exit 1
fi

