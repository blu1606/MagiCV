#!/bin/bash

# Comprehensive API Testing Script for CV Builder
# Tests all endpoints including new CV generation features

API_URL="http://localhost:3000"
USER_ID=""
TEST_RESULTS=()
PASS_COUNT=0
FAIL_COUNT=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         CV BUILDER - COMPREHENSIVE API TEST SUITE         ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo ""

# Function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_code=$5
  local description=$6

  echo -e "${BLUE}Testing:${NC} $name"
  echo "  Description: $description"
  echo -n "  Status: "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TEST_RESULTS+=("✓ $name")
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
    echo "  Response: $body" | head -c 200
    TEST_RESULTS+=("✗ $name")
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  
  echo "$body" | jq '.' 2>/dev/null || echo "$body" | head -c 300
  echo ""
  
  # Return body for further processing
  echo "$body"
}

echo "════════════════════════════════════════════════════════════"
echo "SECTION 1: HEALTH & BASIC ENDPOINTS"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Health Check
test_endpoint "Health Check" "GET" "/api/health" "" "200" \
  "Server health status check"

# 2. Get All Users
USERS_RESPONSE=$(test_endpoint "Get All Users" "GET" "/api/users" "" "200" \
  "Retrieve list of all users")

# Extract first user ID if exists
USER_ID=$(echo "$USERS_RESPONSE" | jq -r '.[0].id // empty' 2>/dev/null)

if [ -z "$USER_ID" ]; then
  echo -e "${YELLOW}⚠️  No users found. Creating test user...${NC}"
  echo ""
  
  # Create a test user
  CREATE_USER_RESPONSE=$(test_endpoint "Create Test User" "POST" "/api/users" \
    '{"email":"test-cv-builder@example.com","name":"Test CV User"}' "201" \
    "Create new user for testing")
  
  USER_ID=$(echo "$CREATE_USER_RESPONSE" | jq -r '.id // empty' 2>/dev/null)
fi

if [ -n "$USER_ID" ]; then
  echo -e "${GREEN}Using User ID: $USER_ID${NC}"
  echo ""
else
  echo -e "${RED}Failed to get or create user. Exiting.${NC}"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
echo "SECTION 2: USER MANAGEMENT"
echo "════════════════════════════════════════════════════════════"
echo ""

# 3. Get User by ID
test_endpoint "Get User by ID" "GET" "/api/users/$USER_ID" "" "200" \
  "Retrieve specific user details"

# 4. Update User
test_endpoint "Update User" "PUT" "/api/users/$USER_ID" \
  '{"name":"Test CV User (Updated)"}' "200" \
  "Update user information"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 3: COMPONENTS MANAGEMENT"
echo "════════════════════════════════════════════════════════════"
echo ""

# 5. Get User Components
COMPONENTS_RESPONSE=$(test_endpoint "Get User Components" "GET" "/api/components/$USER_ID" "" "200" \
  "Retrieve all components for user")

TOTAL_COMPONENTS=$(echo "$COMPONENTS_RESPONSE" | jq -r '.total // 0' 2>/dev/null)

if [ "$TOTAL_COMPONENTS" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No components found. Crawling GitHub data...${NC}"
  echo ""
  
  # 6. Crawl GitHub Data
  test_endpoint "Crawl GitHub Data" "POST" "/api/crawl/github" \
    "{\"userId\":\"$USER_ID\",\"username\":\"octocat\",\"maxRepos\":3,\"includeReadme\":false}" "200" \
    "Crawl and import GitHub profile data"
  
  echo "Waiting 3 seconds for data processing..."
  sleep 3
  
  # Re-check components
  COMPONENTS_RESPONSE=$(test_endpoint "Get Components (After Crawl)" "GET" "/api/components/$USER_ID" "" "200" \
    "Verify components were created")
fi

# 7. Get Components by Type
test_endpoint "Get Experience Components" "GET" "/api/components/$USER_ID?type=experience" "" "200" \
  "Filter components by type (experience)"

# 8. Get Components by Source
test_endpoint "Get GitHub Components" "GET" "/api/components/$USER_ID?source=github" "" "200" \
  "Filter components by source (GitHub)"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 4: DATA CRAWLING"
echo "════════════════════════════════════════════════════════════"
echo ""

# 9. Crawl LinkedIn Data (structured input)
test_endpoint "Process LinkedIn Data" "POST" "/api/crawl/linkedin" \
  "{
    \"userId\":\"$USER_ID\",
    \"profile\":{\"name\":\"John Doe\",\"headline\":\"Software Engineer\"},
    \"experiences\":[{\"title\":\"Senior Developer\",\"company\":\"Tech Corp\",\"startDate\":\"2020-01\",\"description\":\"Led development team\"}],
    \"education\":[{\"school\":\"University\",\"degree\":\"BS Computer Science\",\"field\":\"CS\"}],
    \"skills\":[\"JavaScript\",\"React\",\"Node.js\"]
  }" "200" \
  "Import structured LinkedIn profile data"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 5: JOB DESCRIPTION EXTRACTION"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}Note:${NC} JD extraction requires PDF file upload (multipart/form-data)"
echo "Skipping PDF upload test in automated script."
echo "Manual test command:"
echo "  curl -X POST '$API_URL/api/jd/extract' \\"
echo "    -F \"file=@path/to/job-description.pdf\" \\"
echo "    -F \"userId=$USER_ID\""
echo ""

# 10. Get Extracted JDs
test_endpoint "Get Extracted Job Descriptions" "GET" "/api/jd/extract?userId=$USER_ID" "" "200" \
  "Retrieve all extracted job descriptions"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 6: CV MATCHING & GENERATION"
echo "════════════════════════════════════════════════════════════"
echo ""

JOB_DESCRIPTION="We are looking for a Senior Full-Stack Developer with 3+ years of experience in React, Node.js, and TypeScript. Experience with cloud platforms (AWS/GCP) is a plus. The ideal candidate will lead development projects and mentor junior developers."

# 11. Calculate Match Score
echo -e "${YELLOW}Note: This requires SQL functions to be set up in Supabase.${NC}"
echo -e "${YELLOW}If not set up, this will fail with 'function not found' error.${NC}"
echo ""

test_endpoint "Calculate CV Match Score" "POST" "/api/cv/match" \
  "{
    \"userId\":\"$USER_ID\",
    \"jobDescription\":\"$JOB_DESCRIPTION\",
    \"detailed\":true
  }" "200" \
  "Calculate match score between user CV and job description"

# 12. Get Match History
test_endpoint "Get Match History" "GET" "/api/cv/match?userId=$USER_ID" "" "200" \
  "Retrieve saved match scores"

# 13. Preview CV Content (no PDF generation)
echo -e "${YELLOW}Note: This may take 10-30 seconds (LLM processing)${NC}"
test_endpoint "Preview CV Content" "GET" \
  "/api/cv/generate?userId=$USER_ID&jobDescription=$(echo $JOB_DESCRIPTION | jq -sRr @uri)" "" "200" \
  "Generate CV content preview without PDF"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 7: PDF GENERATION"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}Note:${NC} Full PDF generation test (takes 30-60 seconds)"
echo -e "${YELLOW}This requires:${NC}"
echo "  1. SQL functions in Supabase (match_components)"
echo "  2. Online LaTeX compiler (or local pdflatex)"
echo "  3. Storage bucket 'cv_pdfs' in Supabase"
echo ""

read -p "Do you want to test PDF generation? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Generating PDF... (this may take up to 60 seconds)"
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/cv/generate" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\":\"$USER_ID\",
      \"jobDescription\":\"$JOB_DESCRIPTION\",
      \"includeProjects\":true,
      \"useOnlineCompiler\":true,
      \"saveToDatabase\":true
    }" \
    --output "generated-cv-test-$USER_ID.pdf")
  
  http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" = "200" ]; then
    if [ -f "generated-cv-test-$USER_ID.pdf" ]; then
      FILE_SIZE=$(ls -lh "generated-cv-test-$USER_ID.pdf" | awk '{print $5}')
      echo -e "${GREEN}✓ PDF Generation PASS${NC}"
      echo "  File: generated-cv-test-$USER_ID.pdf"
      echo "  Size: $FILE_SIZE"
      TEST_RESULTS+=("✓ Generate CV PDF")
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      echo -e "${RED}✗ PDF file not created${NC}"
      TEST_RESULTS+=("✗ Generate CV PDF")
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    echo -e "${RED}✗ PDF Generation FAIL (HTTP $http_code)${NC}"
    TEST_RESULTS+=("✗ Generate CV PDF")
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo ""
else
  echo "Skipped PDF generation test."
  echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "SECTION 8: SEARCH FUNCTIONALITY"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}Note: Search endpoints require SQL functions${NC}"

# 14. Search Components
test_endpoint "Search Components (Vector)" "POST" "/api/search/components" \
  "{
    \"userId\":\"$USER_ID\",
    \"query\":\"React developer with strong JavaScript skills\",
    \"limit\":5
  }" "200" \
  "Semantic search for relevant components"

# 15. Search Job Descriptions
test_endpoint "Search Job Descriptions" "POST" "/api/search/job-descriptions" \
  "{
    \"userId\":\"$USER_ID\",
    \"query\":\"Senior backend engineer\",
    \"limit\":3
  }" "200" \
  "Search through saved job descriptions"

echo "════════════════════════════════════════════════════════════"
echo "SECTION 9: CLEANUP OPERATIONS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Optional: Delete test data
read -p "Do you want to delete test components? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  test_endpoint "Delete GitHub Components" "DELETE" \
    "/api/components/$USER_ID?source=github" "" "200" \
    "Clean up GitHub components"
fi

echo "════════════════════════════════════════════════════════════"
echo "                     TEST SUMMARY                           "
echo "════════════════════════════════════════════════════════════"
echo ""

for result in "${TEST_RESULTS[@]}"; do
  echo "$result"
done

echo ""
echo "────────────────────────────────────────────────────────────"
echo -e "Total Tests: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo "────────────────────────────────────────────────────────────"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🎉 ALL TESTS PASSED! SYSTEM WORKING PERFECTLY!  ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${YELLOW}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║  ⚠️  SOME TESTS FAILED - CHECK SETUP REQUIREMENTS ║${NC}"
  echo -e "${YELLOW}╚════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Common issues:"
  echo "  1. SQL functions not created in Supabase"
  echo "     → Run: src/lib/supabase-functions.sql"
  echo "  2. Storage bucket 'cv_pdfs' not created"
  echo "     → Create in Supabase Dashboard"
  echo "  3. Environment variables missing"
  echo "     → Check .env file"
  exit 1
fi

