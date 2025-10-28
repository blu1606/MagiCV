# 🚀 IMPLEMENTATION ROADMAP - magiCV

**Document**: Complete guide for building all missing pages and components
**Status**: Phase 2 - Ready for v0/Loveable/AI implementation
**Last Updated**: 2025-10-28

---

## 📋 QUICK REFERENCE

### Missing Pages (6 total)
1. ✅ Landing Page (Done - Phase 1)
2. ⏳ /onboarding/profession-select
3. ⏳ /data-sources (Dashboard)
4. ⏳ /components/library
5. ⏳ /cv/generate
6. ⏳ /editor/[id] (Most complex)

### Reusable Components (4+)
- Match Score Badge
- Draggable Component Card
- Editable Section Header
- Real-Time Status Indicator

### Color Palette (STRICT)
```
Primary:    #0ea5e9  (Ocean Blue)
Accent:     #f97316  (Sunset Orange)
Background: #0f172a  (Deep Navy)
Success:    #22d3ee  (Electric Cyan)
Text:       #ffffff (white) + #cbd5e1 (gray-300)
```

---

## 🎯 PHASE 2: IMPLEMENTATION PLAN

### Week 1: Critical Path (P1)

#### Day 1-2: Onboarding
- **File**: `/onboarding/profession-select`
- **Prompt**: [See UI_UX_ENHANCEMENT_PLAN.md section]
- **Dependencies**: Supabase profile update
- **Time**: 1-2 hours

#### Day 3-4: Data Sources Dashboard
- **File**: `/data-sources` (extend existing dashboard)
- **Prompt**: [See UI_UX_ENHANCEMENT_PLAN.md section]
- **Dependencies**: API endpoints for sync status
- **Time**: 2-3 hours

#### Day 5: CV Generator
- **File**: `/cv/generate`
- **Prompt**: [See UI_UX_ENHANCEMENT_PLAN.md section]
- **Dependencies**: POST /api/cv/generate API
- **Time**: 2-3 hours

### Week 2: Core Features (P1)

#### Day 1-4: CV Editor (Complex)
- **File**: `/editor/[id]`
- **Prompt**: [See UI_UX_ENHANCEMENT_PLAN.md section]
- **Key Features**: 2-panel layout, drag-drop, real-time match score
- **Dependencies**: Multiple APIs (generate, match, update, rephrase, export)
- **Time**: 4-5 hours

#### Day 5: Component Library
- **File**: `/components/library`
- **Prompt**: [See UI_UX_ENHANCEMENT_PLAN.md section]
- **Dependencies**: Component CRUD APIs
- **Time**: 2-3 hours

### Week 3: Polish & Enhancement (P2)

#### Components & Supporting Pages
- Match Score Badge component
- Draggable cards
- CV list page
- Settings refinements

---

## 💡 HOW TO USE AI TOOLS

### For v0 / Loveable / Claude Artifacts

1. **Copy the design prompt** from UI_UX_ENHANCEMENT_PLAN.md
2. **Add this context**:
   ```
   Framework: React + Next.js 15 + TypeScript + Tailwind CSS
   Components: shadcn/ui
   Icons: lucide-react
   Animations: Tailwind transitions + motion/react
   Build target: MagicCV project
   ```

3. **Example usage**:
   - Go to [v0.dev](https://v0.dev) or [Loveable.dev](https://loveable.ai)
   - Paste prompt + context
   - Generate component
   - Export as React component
   - Integrate into project

### For Cursor / Claude AI (In IDE)

Use `/edit` command with this template:
```
Create component/page for magiCV

Context:
- Dark mode theme (deep navy #0f172a)
- Color palette: Blue #0ea5e9, Orange #f97316, Cyan #22d3ee
- Framework: Next.js 15 + TypeScript + Tailwind
- Component library: shadcn/ui

Requirements:
[Copy full prompt from UI_UX_ENHANCEMENT_PLAN.md]

Return complete, production-ready component.
```

---

## 📱 PAGES OVERVIEW

### 1. Onboarding: Profession Select
**Status**: Ready for generation
**Complexity**: Low
**Dependencies**: 1 API call
**Prompt**: ✅ [In UI_UX_ENHANCEMENT_PLAN.md]

### 2. Data Sources Dashboard
**Status**: Ready for generation
**Complexity**: Medium
**Dependencies**: 3 API endpoints
**Prompt**: ✅ [In UI_UX_ENHANCEMENT_PLAN.md]

### 3. Component Library
**Status**: Ready for generation
**Complexity**: Medium-High
**Dependencies**: 5 API endpoints (CRUD)
**Prompt**: ✅ [In UI_UX_ENHANCEMENT_PLAN.md]

### 4. CV Generator Form
**Status**: Ready for generation
**Complexity**: Low-Medium
**Dependencies**: 1 API endpoint
**Prompt**: ✅ [In UI_UX_ENHANCEMENT_PLAN.md]

### 5. CV Editor (2-Panel)
**Status**: Ready for generation
**Complexity**: ⭐⭐⭐⭐⭐ (Highest)
**Dependencies**: 7 API endpoints
**Key Features**: 
- Drag-drop (react-beautiful-dnd)
- Real-time match score (<500ms)
- Inline editing
- Context menus
- PDF export
**Prompt**: ✅ [In UI_UX_ENHANCEMENT_PLAN.md]

---

## 🔧 REQUIRED API ENDPOINTS

### Phase 2 API Dependencies

```typescript
// User Profile
POST /api/users/profile         // Save profession
GET /api/users                  // Get user data

// Data Sources
GET /api/data-sources/status    // Check sync status
POST /api/data-sources/sync     // Sync specific source
POST /api/data-sources/connect  // Connect new source

// Components
GET /api/components?type=X      // List by type
POST /api/components            // Create
PUT /api/components/[id]        // Update
DELETE /api/components/[id]     // Delete
POST /api/components/[id]/match // Calculate match score

// CV Operations
POST /api/cv/generate           // FR6: One-click autofill
GET /api/cv/[id]               // Get CV data
PUT /api/cv/[id]               // Update CV
GET /api/cv/list               // List user CVs
DELETE /api/cv/[id]            // Delete CV
POST /api/cv/match             // FR8: Real-time score
POST /api/cv/[id]/rephrase     // FR9: AI rephrase
GET /api/cv/[id]/export        // FR10: PDF export
```

**Note**: Most APIs already exist in Mastra backend. Need to:
1. Verify endpoints
2. Add missing ones (rephrase, export)
3. Test integration

---

## 🎨 COMPONENT CHECKLIST

### Pre-built Available
- ✅ Button
- ✅ Input
- ✅ Card
- ✅ Tabs
- ✅ Particles
- ✅ GridPattern
- ✅ NumberTicker
- ✅ AnimatedGradientText

### Need to Create
- ⏳ Match Score Badge (circular progress)
- ⏳ Draggable Component Card
- ⏳ Editable Section Header
- ⏳ Real-Time Status Indicator

### Third-party Dependencies
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "motion": "^latest",
  "react-hot-toast": "^latest"
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 2A: Week 1
- [ ] Profession Select Page
  - [ ] Component created
  - [ ] API integrated
  - [ ] Tested end-to-end
- [ ] Data Sources Page
  - [ ] Component created
  - [ ] API integrated
  - [ ] Tested sync functionality
- [ ] CV Generator Page
  - [ ] Component created
  - [ ] API integrated
  - [ ] Loading states working

### Phase 2B: Week 2
- [ ] CV Editor Page (Complex!)
  - [ ] Layout structure (2-panel)
  - [ ] Drag-drop functionality
  - [ ] Real-time match score
  - [ ] Inline editing
  - [ ] Save functionality
  - [ ] Export PDF button
- [ ] Component Library Page
  - [ ] Tab navigation
  - [ ] CRUD operations
  - [ ] Search/filter
  - [ ] Match score display

### Phase 2C: Week 3
- [ ] Match Score Badge Component
- [ ] Supporting Components
- [ ] Polish & animations
- [ ] Testing & bug fixes

---

## 🚀 QUICK START FOR v0 / LOVEABLE

### Step 1: Pick a page
Choose from the 6 missing pages above

### Step 2: Copy full prompt
Find detailed prompt in: **MagicCV/UI_UX_ENHANCEMENT_PLAN.md**

### Step 3: Add context
```
Framework: Next.js 15, React, TypeScript, Tailwind CSS
UI Library: shadcn/ui
Icons: lucide-react
Package Manager: pnpm

Use dark mode with color palette:
- Primary: #0ea5e9
- Accent: #f97316
- Background: #0f172a
- Success: #22d3ee

Return complete, production-ready component with:
- State management
- API integration
- Error handling
- Responsive design
- Loading states
```

### Step 4: Generate
- For v0: Go to v0.dev, paste prompt, generate
- For Loveable: Go to loveable.ai, paste prompt, generate
- For Cursor: Use `/edit` command with full prompt

### Step 5: Integrate
- Copy generated code
- Paste into appropriate directory
- Import and wire up in layout
- Test with dev server

---

## 📊 PROGRESS TRACKING

| Feature | Status | Owner | ETA |
|---------|--------|-------|-----|
| Landing Page | ✅ Done | - | - |
| Onboarding | 🔄 Ready | - | Week 1 |
| Data Sources | 🔄 Ready | - | Week 1 |
| CV Generator | 🔄 Ready | - | Week 1 |
| CV Editor | 🔄 Ready | - | Week 2 |
| Component Library | 🔄 Ready | - | Week 2 |
| Match Badge Component | 🔄 Ready | - | Week 3 |

---

## 🎯 SUCCESS CRITERIA

### Phase 2 Completion When:
- ✅ All 6 pages created and styled
- ✅ Dark mode theme applied consistently
- ✅ Color palette used throughout
- ✅ All APIs integrated and tested
- ✅ Real-time match score working (<500ms)
- ✅ Drag-drop functionality working
- ✅ PDF export working
- ✅ End-to-end user flows tested
- ✅ Responsive on desktop/tablet
- ✅ No console errors

---

## 📚 RELATED DOCUMENTS

- **UI/UX Enhancement Plan**: MagicCV/UI_UX_ENHANCEMENT_PLAN.md
- **Requirements**: CV/docs/prd/requirements.md
- **UI Design Goals**: CV/docs/prd/ui-design.md
- **Integration Plan**: KẾ_HOẠCH_TÍCH_HỢP.md

---

## 💬 PROMPTS QUICK LINKS

All design prompts are in: **MagicCV/UI_UX_ENHANCEMENT_PLAN.md**

Section headers:
- Page 1 prompt: "Design Prompt for v0/Loveable:"
- Page 2 prompt: "Design Prompt for v0/Loveable:"
- Page 3 prompt: "Design Prompt for v0/Loveable:"
- Page 4 prompt: "Design Prompt for v0/Loveable:"
- Page 5 prompt: "Design Prompt for v0/Loveable:"
- Component 1 prompt: "Design Prompt:"
- Component 2 prompt: "Design Prompt:"
- Component 3 prompt: "Design Prompt:"
- Component 4 prompt: "Design Prompt:"

---

**🎉 Ready to start building! All prompts and specs are prepared.**
