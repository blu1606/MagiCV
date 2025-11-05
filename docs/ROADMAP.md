# MagiCV Development Roadmap

## Executive Summary

**Current Status:** 🟡 Beta (Core features working, UX needs polish)
- **Code Quality:** ⭐⭐⭐⭐☆ (4/5)
- **Feature Completeness:** 70%
- **Production Readiness:** 60%
- **Time to MVP:** 3-4 weeks

---

## Pain Points vs Solutions Matrix

| User Pain Point | Current Status | Gap | Priority |
|-----------------|----------------|-----|----------|
| ⏱️ Takes 45min to create custom CV | ✅ **SOLVED** - 3s generation | None | - |
| 🎯 Hard to tailor CV to each JD | ✅ **SOLVED** - AI matching | None | - |
| 📊 No way to measure CV quality | ✅ **SOLVED** - Match score 0-100 | Better ATS insights needed | P2 |
| 🔀 Data scattered (GitHub/LinkedIn) | ✅ **SOLVED** - Auto-crawl | Can't edit crawled data | 🔴 P0 |
| 📝 Generic summaries don't stand out | ✅ **SOLVED** - Seniority-aware summaries | None | - |
| 🎨 Only one CV design | ❌ **NOT SOLVED** | No template selection | 🔴 P0 |
| 💾 Can't save/organize multiple CVs | ⚠️ **PARTIAL** - Can save but can't download | Download broken | 🔴 P0 |
| 🔄 Lost changes, no version history | ⚠️ **PARTIAL** - Versions tracked but no UI | No restore function | 🟡 P1 |
| 🤷 Don't know what to improve | ⚠️ **PARTIAL** - Match score only | Need detailed suggestions | 🟡 P1 |
| 📧 Need cover letter too | ❌ **NOT SOLVED** | Feature gap | 🟢 P2 |

**Legend:**
- 🔴 P0 = Critical (blocks core workflow)
- 🟡 P1 = High (reduces UX quality significantly)
- 🟢 P2 = Medium (nice-to-have, enhances value)
- ⚪ P3 = Low (future consideration)

---

## Phase Breakdown

### 📍 PHASE 0: Critical Fixes (Week 1) 🔥

**Goal:** Fix broken core workflows to make product actually usable

**Blockers Fixed:**

#### 1. Dashboard Generate CV Dialog (**4h**)
- **File:** `src/components/dashboard-page.tsx:77-92`
- **Current:** Dialog just logs, doesn't call API
- **Fix:** Call `/api/cv/generate`, download PDF, refresh list
- **Code:**
```typescript
const handleGenerateCV = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      body: JSON.stringify({
        jobDescription,
        saveToDatabase: true,
        title: `CV for ${extractCompany(jobDescription)}`
      })
    });

    const blob = await response.blob();
    downloadBlob(blob, `CV_${Date.now()}.pdf`);

    toast.success('CV generated successfully!');
    setGenerateDialogOpen(false);
    await refetchCVs();
  } catch (error) {
    toast.error('Failed to generate CV');
  } finally {
    setIsGenerating(false);
  }
};
```

#### 2. CV Download from Dashboard (**3h**)
- **File:** `src/components/dashboard-page.tsx:362-367`
- **Current:** Download button does nothing
- **Fix:** Create `/api/cv/[id]/download` endpoint
- **New File:** `src/app/api/cv/[id]/download/route.ts`
```typescript
export async function GET(req, { params }) {
  const cv = await SupabaseService.getCVById(params.id);
  const pdfs = await SupabaseService.getCVPdfsByCVId(cv.id);

  // Get latest PDF from storage
  const { data } = await supabase.storage
    .from('cv-pdfs')
    .download(pdfs[0].file_url);

  return new NextResponse(data, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfs[0].filename}"`
    }
  });
}
```

#### 3. Missing Profile Fields (**2h**)
- **File:** `src/lib/supabase-schema.sql`, `src/services/cv-generator-service.ts`
- **Current:** Phone, address hardcoded as dummy data
- **Fix:** Add columns, create edit profile UI
```sql
ALTER TABLE profiles
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip TEXT;
```

#### 4. Match Score API Endpoint (**3h**)
- **File:** Missing `src/app/api/magiccv/match/route.ts`
- **Current:** CV editor calls non-existent endpoint
- **Fix:** Create API that calculates match in real-time
```typescript
export async function POST(request: NextRequest) {
  const { jobDescription } = await request.json();
  const { data: { user } } = await supabase.auth.getUser();

  const matchResult = await JDMatchingService.matchJD(
    user.id,
    jobDescription
  );

  return NextResponse.json({
    score: matchResult.overallScore,
    categoryScores: matchResult.categoryScores,
    suggestions: matchResult.suggestions,
    topMatches: matchResult.matches.slice(0, 5)
  });
}
```

#### 5. User-Friendly Error Messages (**2h**)
- **Files:** All API routes
- **Current:** Technical errors shown to users
- **Fix:** Error message mapping utility
```typescript
// src/lib/error-messages.ts
export const USER_FRIENDLY_ERRORS = {
  'GOOGLE_GENERATIVE_AI_API_KEY not found':
    'AI service is temporarily unavailable. Please try again later.',
  'Profile not found':
    'Please complete your profile setup first.',
  'No components found':
    'Import your data from GitHub or LinkedIn to get started.',
  'pdflatex is not installed':
    'PDF generation is processing. This may take a few moments.',
  'Failed to generate embedding':
    'Connection to AI service failed. Please check your internet and try again.',
};

export function getUserFriendlyError(error: Error): string {
  return USER_FRIENDLY_ERRORS[error.message] ||
         'Something went wrong. Please try again or contact support.';
}
```

**Deliverables:**
- ✅ Dashboard generate CV works end-to-end
- ✅ Can download existing CVs
- ✅ Profile has complete contact info
- ✅ Real-time match score works
- ✅ Errors are understandable

**Testing Checklist:**
```bash
# Test dashboard generate
1. Open dashboard
2. Click "Generate CV"
3. Paste JD
4. Click Generate
5. ✅ PDF downloads
6. ✅ CV appears in list

# Test download
1. Click download on existing CV
2. ✅ PDF downloads with correct name

# Test profile
1. Go to /settings
2. Edit phone, address
3. Generate CV
4. ✅ PDF has correct contact info
```

**Total Time:** 14 hours (~2 days)

---

### 📍 PHASE 1: Component Management (Week 2) 🧩

**Goal:** Users can view, edit, delete, and manually add components

**Why Critical:**
- Auto-crawled data often has errors/duplicates
- Users want to customize their data
- Missing experiences/skills need manual input

#### 1. Component Library Page (**8h**)
- **File:** Enhance `src/app/library/page.tsx`
- **Features:**
  - List all components (experiences, projects, education, skills)
  - Filter by type
  - Search by keyword
  - Sort by date/relevance
  - Select multiple for bulk actions

**UI Mockup:**
```
┌─────────────────────────────────────────────┐
│ Component Library                 [+ Add New]│
├─────────────────────────────────────────────┤
│ 🔍 Search...    [Type: All ▼] [Sort: Date ▼]│
├─────────────────────────────────────────────┤
│ ☐ Senior Frontend Engineer @ TechCorp       │
│   2020-2023 · Experience · Match: 95%       │
│   [Edit] [Delete]                           │
├─────────────────────────────────────────────┤
│ ☐ React, TypeScript, Next.js                │
│   Skill · Auto-imported from GitHub         │
│   [Edit] [Delete]                           │
├─────────────────────────────────────────────┤
│ [Bulk Actions: Delete Selected (2)]         │
└─────────────────────────────────────────────┘
```

#### 2. Edit Component Modal (**4h**)
- Form with fields: title, organization, dates, description, highlights
- Rich text editor for description
- Tags management
- Re-generate embedding on save

#### 3. Delete Component (**2h**)
- Confirmation dialog
- Cascade delete from CVs that reference it
- Soft delete (mark as `deleted_at` instead of hard delete)

#### 4. Manual Add Component (**4h**)
- Form for each component type
- AI-assisted filling (paste text, AI extracts fields)
- Auto-generate embedding

#### 5. Component Suggestions (**6h**)
- "Missing Components" section
- AI analyzes existing components and suggests:
  - "Add leadership experience for senior roles"
  - "Include certifications to stand out"
  - "Add metrics to quantify impact"

**Total Time:** 24 hours (~3 days)

---

### 📍 PHASE 2: UX Polish (Week 3) ✨

**Goal:** Professional, polished user experience

#### 1. Loading States & Skeletons (**6h**)
- Skeleton loaders for:
  - Dashboard CV list
  - Component library
  - CV generation progress
- Progress bars for:
  - PDF generation (Analyzing JD → Matching → Generating → Done)
  - Data crawling (GitHub → LinkedIn → Processing → Done)

**Example:**
```typescript
// CV Generation Progress
<Progress value={progress} />
{step === 1 && "📄 Analyzing job description..."}
{step === 2 && "🔍 Finding relevant components..."}
{step === 3 && "🤖 Optimizing content with AI..."}
{step === 4 && "📝 Generating PDF..."}
```

#### 2. Onboarding Wizard (**8h**)
- Step 1: Welcome → Explain value prop
- Step 2: Connect GitHub → Auto-import projects
- Step 3: Connect LinkedIn → Auto-import experiences
- Step 4: Upload sample JD → Generate first CV
- Step 5: Success! → Tour of dashboard

**Tech:** Use `react-joyride` for guided tour

#### 3. Empty States (**4h**)
- No CVs yet: "Generate your first CV to get started!"
- No components: "Import data from GitHub/LinkedIn"
- No matches: "Try adjusting your profile or the job description"

#### 4. Toast Notifications (**3h**)
- Success: "CV generated successfully!"
- Error: "Failed to generate CV. Please try again."
- Info: "Importing data from GitHub..."
- Warning: "Some components have missing information"

**Library:** Use `sonner` (already in package.json)

#### 5. Responsive Design Fixes (**4h**)
- Test on mobile (iPhone/Android)
- Fix overflow issues
- Adjust spacing for small screens
- Mobile-friendly component library

**Total Time:** 25 hours (~3 days)

---

### 📍 PHASE 3: Template System (Week 4) 🎨

**Goal:** Multiple professional CV templates

#### 1. Template Architecture (**6h**)
- Define template schema:
```typescript
interface CVTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  latex: string; // Template content
  category: 'modern' | 'classic' | 'minimal' | 'ats-friendly';
  colors: { primary: string; secondary: string; };
  fonts: { heading: string; body: string; };
}
```

- Template registry:
```typescript
// src/lib/templates/index.ts
export const TEMPLATES = {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  ats: atsTemplate,
};
```

#### 2. Create 4 Templates (**12h**)
1. **Modern** (current `resume.tex.njk`) - Colorful, icons, 2-column
2. **Classic** - Traditional, serif font, 1-column
3. **Minimal** - Clean, sans-serif, lots of whitespace
4. **ATS-Friendly** - Plain text-like, no graphics, keyword-optimized

**Resources:**
- Overleaf CV templates
- LaTeX templates from GitHub

#### 3. Template Selector UI (**6h**)
- Gallery view with previews
- Filter by category
- Preview before selecting
- Save template preference per user

**UI:**
```
┌────────────────────────────────────────────┐
│ Choose a Template                 [Modern ▼]│
├────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ Mod │ │ Cla │ │ Min │ │ ATS │           │
│ │ ern │ │ sic │ │ imal│ │     │           │
│ └─────┘ └─────┘ └─────┘ └─────┘           │
│   ✅      ☐       ☐       ☐                │
│                                            │
│ Preview: [Large preview of selected]       │
│                                            │
│ [Use This Template]                        │
└────────────────────────────────────────────┘
```

#### 4. Template Customization (**4h**)
- Color picker for primary/secondary colors
- Font selector (3-5 safe options)
- Spacing adjuster (compact/normal/spacious)

**Total Time:** 28 hours (~3.5 days)

---

### 📍 PHASE 4: Enhanced AI Features (Week 5-6) 🤖

**Goal:** AI features that truly differentiate MagicCV

#### 1. Cover Letter Generation (**10h**)
- **API:** `POST /api/cv/generate-cover-letter`
- **Input:** CV ID + JD
- **Process:**
  1. Extract key achievements from CV
  2. Analyze company culture from JD
  3. Match achievements to job requirements
  4. Generate personalized 3-paragraph letter

**Prompt Engineering:**
```typescript
const prompt = `Generate a professional cover letter for this job application.

JOB DESCRIPTION:
${jd.description}

CANDIDATE CV HIGHLIGHTS:
- ${topExperiences.map(e => e.highlights[0]).join('\n- ')}

REQUIREMENTS:
1. Opening paragraph: Show enthusiasm + mention company specifically
2. Body paragraphs: Connect 2-3 relevant achievements to job requirements
3. Closing: Express interest in interview
4. Tone: Professional but personable
5. Length: 250-350 words

Company culture keywords from JD: ${cultureKeywords.join(', ')}

Generate ONLY the letter text, no extra commentary.`;
```

#### 2. ATS Score Prediction (**8h**)
- **Feature:** Analyze CV for ATS compatibility
- **Checks:**
  - Keyword density vs JD
  - Section headers (standard vs custom)
  - File format (avoid tables, graphics)
  - Font readability
  - Length (1-2 pages ideal)

**Output:**
```
ATS Score: 85/100 ⭐⭐⭐⭐☆

✅ Good:
- 78% keyword match with JD
- Standard section headers
- Clean formatting
- 1.5 pages

⚠️ Needs Improvement:
- Missing keyword "microservices" (mentioned 5x in JD)
- "Activities" section might confuse some ATS
- Consider moving skills to top

🔧 Quick Fixes:
1. Add "microservices" to experience descriptions
2. Rename "Activities" to "Leadership Experience"
3. Create a "Core Skills" section at top
```

#### 3. Interview Prep Assistant (**12h**)
- **Feature:** Generate likely interview questions based on JD + CV
- **Questions Categories:**
  - Technical: Based on required skills
  - Behavioral: STAR method for experiences
  - Company-specific: Research company values

**Example Output:**
```
📝 Likely Interview Questions (15 total)

TECHNICAL (5):
1. "Explain how you would design a microservices architecture"
   → Based on: JD requires "microservices", you have experience at TechCorp

   Suggested Answer Framework:
   - Start with: "At TechCorp, I architected a microservices system..."
   - Include metrics: "Scaled to handle 100K requests/day"
   - Mention tech: "Used Docker, Kubernetes, gRPC"

BEHAVIORAL (5):
2. "Tell me about a time you led a difficult project"
   → Based on: "Led team of 5 engineers" in your experience

   STAR Framework:
   - Situation: Project behind schedule
   - Task: Deliver on time without sacrificing quality
   - Action: Reorganized sprints, daily standups
   - Result: Shipped 2 weeks early, 0 critical bugs

COMPANY-SPECIFIC (5):
3. "Why do you want to work at Google?"
   → Research: Google values innovation, scale, impact

   Talking Points:
   - Your experience scaling systems (aligns with Google scale)
   - Passion for AI/ML (Google's focus area)
   - Mention specific Google product you admire
```

#### 4. Skill Gap Analysis (**6h**)
- Compare user skills vs job market trends
- Recommend courses/certifications
- Show skill progression timeline

**Output:**
```
📊 Skill Gap Analysis

JOB REQUIREMENTS vs YOUR PROFILE:

✅ Strong Match (5):
- React: 95% (you have 4 years exp)
- TypeScript: 92%
- AWS: 88%

⚠️ Gaps (3):
- Kubernetes: 40% (JD requires, you have basic knowledge)
  → Recommend: "Kubernetes for Developers" (Udemy, 12h)

- GraphQL: 30% (trending skill, 60% of senior roles require it)
  → Recommend: "Apollo GraphQL Bootcamp" (Frontend Masters)

- System Design: 50% (interview critical for senior roles)
  → Recommend: "Grokking System Design" (Educative)

📈 Trending Skills in Your Field (2024):
1. AI/ML Integration (+156% demand)
2. Kubernetes/DevOps (+89%)
3. GraphQL (+67%)
```

**Total Time:** 36 hours (~4.5 days)

---

### 📍 PHASE 5: Analytics & Tracking (Week 7) 📊

**Goal:** Help users measure job search success

#### 1. Application Tracker (**10h**)
- Track which CVs sent to which companies
- Application status workflow:
  - Applied → Screening → Interview → Offer → Accepted/Rejected
- Timeline view
- Success rate metrics

**Schema:**
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  cv_id UUID REFERENCES cvs(id),
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  applied_date DATE NOT NULL,
  status TEXT DEFAULT 'applied',
  interview_date DATE,
  offer_amount INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Dashboard Analytics (**8h**)
- Total CVs generated
- Average match score
- Application response rate
- Time-to-offer metrics
- Monthly activity chart

**UI:**
```
┌───────────────────────────────────────────┐
│ Your Job Search Analytics                 │
├───────────────────────────────────────────┤
│ 📊 Overview (Last 30 Days)                │
│                                           │
│ 15 CVs Generated    78% Avg Match         │
│ 8 Applications      37.5% Response Rate   │
│ 3 Interviews        1 Offer Pending       │
│                                           │
│ 📈 Activity Chart                         │
│  │                                        │
│ 5│         ██                            │
│  │     ██  ██  ██                        │
│  │ ██  ██  ██  ██  ██                    │
│  └─────────────────────────              │
│   W1  W2  W3  W4                         │
│                                           │
│ 🎯 Top Performing CVs                     │
│ 1. CV for Google (95% match) → Interview │
│ 2. CV for Meta (92% match) → Screening   │
│ 3. CV for Amazon (88% match) → Applied   │
└───────────────────────────────────────────┘
```

#### 3. Insights & Recommendations (**6h**)
- "You apply mostly to FAANG, but have 80% success with startups"
- "Your CVs with 85%+ match score get 2.3x more responses"
- "Companies respond 40% faster when you apply Mon-Wed"

**Total Time:** 24 hours (~3 days)

---

### 📍 PHASE 6: Collaboration & Sharing (Week 8) 🤝

**Goal:** Get feedback, improve CVs collaboratively

#### 1. Shareable CV Links (**8h**)
- Generate public link: `magicv.com/cv/abc123`
- Options:
  - View-only (default)
  - Allow comments
  - Editable (for recruiters to annotate)
- Expiration settings (7 days, 30 days, never)

**Schema:**
```sql
CREATE TABLE cv_shares (
  id UUID PRIMARY KEY,
  cv_id UUID REFERENCES cvs(id),
  share_token TEXT UNIQUE NOT NULL,
  permissions TEXT DEFAULT 'view', -- view | comment | edit
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Comment System (**10h**)
- Inline comments on CV sections
- Resolve/unresolve threads
- Notifications when someone comments

**UI:**
```
┌────────────────────────────────────────┐
│ EXPERIENCE                             │
│ Senior Frontend Engineer @ TechCorp    │
│ • Built 15+ React applications      [💬2]│
│                                        │
│ Comments (2):                          │
│ ├─ @recruiter: Quantify impact more   │
│ │  → Reply: Good point! Added metrics │
│ └─ @mentor: Add technologies used      │
│    → ✅ Resolved                       │
└────────────────────────────────────────┘
```

#### 3. Suggested Improvements from AI (**6h**)
- AI reviews shared CV and suggests:
  - "Use action verbs (Built, Led, Increased)"
  - "Quantify this: '10+ users' → '2M+ users'"
  - "This bullet is too long (32 words). Split it."

**Total Time:** 24 hours (~3 days)

---

## Timeline Summary

| Phase | Duration | Priority | Effort | Dependencies |
|-------|----------|----------|--------|--------------|
| **Phase 0: Critical Fixes** | Week 1 | 🔴 P0 | 14h | None |
| **Phase 1: Component Mgmt** | Week 2 | 🔴 P0 | 24h | Phase 0 |
| **Phase 2: UX Polish** | Week 3 | 🟡 P1 | 25h | Phase 0 |
| **Phase 3: Templates** | Week 4 | 🔴 P0 | 28h | Phase 0 |
| **Phase 4: Enhanced AI** | Week 5-6 | 🟢 P2 | 36h | Phase 1 |
| **Phase 5: Analytics** | Week 7 | 🟢 P2 | 24h | Phase 0 |
| **Phase 6: Collaboration** | Week 8 | ⚪ P3 | 24h | Phase 0 |

**Total Development Time:** ~175 hours (22 days of 8h work)

**Minimum Viable Product (MVP):** Phase 0 + 1 + 2 + 3 = **91 hours (~11 days)**

---

## Success Metrics

### Phase 0 (Week 1):
- ✅ Dashboard generate works 100% of time
- ✅ Download success rate >95%
- ✅ Error rate <5%

### Phase 1 (Week 2):
- ✅ Users can edit 100% of auto-crawled data
- ✅ Manual component creation works
- ✅ Component suggestion acceptance rate >30%

### Phase 2 (Week 3):
- ✅ Onboarding completion rate >70%
- ✅ Mobile responsive on all pages
- ✅ Page load time <2s

### Phase 3 (Week 4):
- ✅ 4 templates available
- ✅ Template switching works seamlessly
- ✅ Customization options used by >40% of users

### Phase 4-6 (Weeks 5-8):
- Cover letter generation usage: >50% of users
- ATS score feature engagement: >60%
- Application tracking: >30% of users

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LaTeX compilation breaks | High | Medium | Docker image with pdflatex, 3 online fallbacks |
| LLM API rate limits | High | Low | Caching, batch requests, exponential backoff |
| Database migration issues | Medium | Low | Test on staging, rollback plan |
| User data loss | Critical | Very Low | Soft deletes, backups, version control |
| Slow PDF generation | Medium | Medium | Queue system (Bull), show progress |

---

## Post-Launch Iteration Plan

**Week 9-12: Based on User Feedback**
1. Analyze user behavior (Mixpanel/PostHog)
2. A/B test features
3. Prioritize based on:
   - Feature usage frequency
   - User satisfaction (NPS surveys)
   - Revenue impact (if premium tier exists)

**Continuous Improvements:**
- Add more templates monthly
- Improve AI prompts based on user ratings
- Optimize embedding cache hit rate
- Reduce PDF generation time

---

## Dependencies & Prerequisites

### Technical:
- ✅ Supabase setup (done)
- ✅ Google Gemini API key (done)
- ⚠️ LaTeX in Docker (needs setup)
- ⚠️ Redis for caching (optional but recommended)

### Product:
- ✅ User research (done - epics.md)
- ⚠️ Competitive analysis (needed)
- ⚠️ Pricing strategy (if premium tier)

### Team:
- 1 Full-stack developer (full-time)
- 1 Designer (part-time, Phase 2-3)
- 1 AI/ML engineer (part-time, Phase 4)

---

## Conclusion

**MagicCV has strong technical foundations but needs UX polish and feature completion to reach MVP.**

**Recommended Approach:**
1. **Sprint 1-2 (Weeks 1-2):** Fix critical bugs + component management → Make product usable
2. **Sprint 3-4 (Weeks 3-4):** UX polish + templates → Make product delightful
3. **Sprint 5+ (Weeks 5+):** Enhanced AI → Make product magical

**Key Success Factors:**
- ✅ User testing at every phase
- ✅ Incremental releases (ship Phase 0 ASAP, get feedback)
- ✅ Metrics-driven decisions
- ✅ Focus on core workflow quality over feature quantity

**Expected Outcome:**
- Week 4: Production-ready MVP
- Week 8: Feature-complete product
- Week 12: Market-leading CV generation tool
