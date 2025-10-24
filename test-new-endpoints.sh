#!/bin/bash

# Test script for new CV endpoints
API_URL="http://localhost:3002"
USER_ID="c8190249-07bf-4a35-a58f-801f05f9f2e2"

echo "🧪 Testing New CV Builder Endpoints"
echo "===================================="
echo ""
echo "Using User ID: $USER_ID"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Test 1: Health Check"
echo "------------------------"
curl -s "$API_URL/api/health" | jq '.'
echo ""

echo "👤 Test 2: Get User Info"
echo "------------------------"
curl -s "$API_URL/api/users/$USER_ID" | jq '.'
echo ""

echo "📦 Test 3: Get User Components"
echo "------------------------"
COMPONENTS=$(curl -s "$API_URL/api/components/$USER_ID")
TOTAL=$(echo "$COMPONENTS" | jq '.total')
echo "Total components: $TOTAL"
echo "$COMPONENTS" | jq '{total, byType}'
echo ""

if [ "$TOTAL" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No components found. Crawling GitHub data first...${NC}"
  echo ""
  
  echo "🐙 Test 4: Crawl GitHub Data"
  echo "------------------------"
  curl -s -X POST "$API_URL/api/crawl/github" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"username\":\"nxc1802\",\"maxRepos\":3}" | jq '.'
  echo ""
  
  echo "Waiting 2 seconds for data to be processed..."
  sleep 2
  
  echo "📦 Re-checking components..."
  curl -s "$API_URL/api/components/$USER_ID" | jq '{total, byType}'
  echo ""
fi

echo "📊 Test 5: CV Match Score"
echo "------------------------"
JD_TEXT="We are looking for a Senior Full-Stack Developer with experience in React, Node.js, and cloud platforms. Must have 3+ years of experience."

curl -s -X POST "$API_URL/api/cv/match" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"jobDescription\": \"$JD_TEXT\",
    \"detailed\": true
  }" | jq '.'
echo ""

echo "📝 Test 6: Generate CV Content (Preview, no PDF)"
echo "------------------------"
echo -e "${YELLOW}Note: This may take 10-30 seconds as it uses LLM to select components...${NC}"
curl -s "$API_URL/api/cv/generate?userId=$USER_ID&jobDescription=$JD_TEXT&format=json" | jq '{message, matchScore, cvData: {profile, experience: (.cvData.experience | length), education: (.cvData.education | length), skills}}'
echo ""

echo "📄 Test 7: Generate CV PDF"
echo "------------------------"
echo -e "${YELLOW}Note: This will generate a PDF. It may take 30-60 seconds...${NC}"
echo -e "${YELLOW}By default, it will use online compiler (LaTeX.Online) since local pdflatex may not be installed.${NC}"
echo ""

# Test if we should generate PDF
read -p "Do you want to generate PDF? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  curl -X POST "$API_URL/api/cv/generate" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"jobDescription\": \"$JD_TEXT\",
      \"includeProjects\": true,
      \"useOnlineCompiler\": true,
      \"saveToDatabase\": true
    }" \
    --output "generated-cv-${USER_ID}.pdf" \
    -w "\nHTTP Status: %{http_code}\n"
  
  if [ -f "generated-cv-${USER_ID}.pdf" ]; then
    FILE_SIZE=$(ls -lh "generated-cv-${USER_ID}.pdf" | awk '{print $5}')
    echo -e "${GREEN}✓ PDF generated successfully!${NC}"
    echo "File: generated-cv-${USER_ID}.pdf (Size: $FILE_SIZE)"
    echo "You can open it with: open generated-cv-${USER_ID}.pdf"
  else
    echo -e "${RED}✗ PDF generation failed${NC}"
  fi
fi
echo ""

echo "===================================="
echo "✅ Test Suite Completed!"
echo "===================================="
echo ""
echo "📚 Available Endpoints:"
echo "  - GET  /api/users"
echo "  - POST /api/users"
echo "  - GET  /api/users/:userId"
echo "  - GET  /api/components/:userId"
echo "  - POST /api/crawl/github"
echo "  - POST /api/crawl/youtube"
echo "  - POST /api/crawl/linkedin"
echo "  - POST /api/cv/match - Calculate match score"
echo "  - GET  /api/cv/match?userId=xxx - Get saved matches"
echo "  - POST /api/cv/generate - Generate CV PDF"
echo "  - GET  /api/cv/generate?userId=xxx - Preview CV content"
echo "  - POST /api/jd/extract - Extract JD from PDF"
echo "  - GET  /api/jd/extract?userId=xxx - Get extracted JDs"
echo ""

