# CV Workflow Improvement Solutions

## SOLUTION 1: Enhanced Component Matching + Professional Summary Generation ⭐⭐⭐⭐⭐

### Overview
Cải thiện matching algorithm để cover all component types và thêm AI-generated professional summary phù hợp với HR expectations.

### Architecture

```
┌─────────────────────┐
│ JD Upload           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ ENHANCED MATCHING ENGINE            │
│ ┌─────────────────────────────────┐ │
│ │ 1. Extract JD Requirements      │ │
│ │    - Skills                     │ │
│ │    - Experience level           │ │
│ │    - Education requirements     │ │
│ │    - Project complexity         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2. Match ALL Component Types    │ │
│ │    - Experience (title, role)   │ │
│ │    - Education (degree, field)  │ │
│ │    - Skills (technical)         │ │
│ │    - Projects (domain match)    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 3. Generate Professional Summary│ │
│ │    Based on:                    │ │
│ │    - Top matched experiences    │ │
│ │    - Key skills                 │ │
│ │    - JD requirements            │ │
│ │    - Seniority level            │ │
│ └─────────────────────────────────┘ │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ COMPLETE CV DATA                    │
│ {                                   │
│   professionalSummary: "...",       │
│   experience: [...],                │
│   education: [...],                 │
│   skills: {...},                    │
│   projects: [...]                   │
│ }                                   │
└─────────────────────────────────────┘
```

### Implementation Details

#### A. Enhanced LaTeX Template with Professional Summary

**File:** `resume-with-summary.tex.njk`

```latex
\documentclass[11pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[left={{ margins.left }},top={{ margins.top }},right={{ margins.right }},bottom={{ margins.bottom }}]{geometry}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}

\begin{document}

% Header
\begin{center}
    \textbf{\LARGE {{ profile.name }}}\\
    \hrulefill
\end{center}

% Contact
\begin{center}
    {{ profile.address }} \textbullet{} {{ profile.city_state_zip }} \\
    \href{mailto:{{ profile.email }}}{{ profile.email }} \textbullet{} {{ profile.phone }}
\end{center}

\vspace{0.5cm}

% ============ PROFESSIONAL SUMMARY ============
{% if professionalSummary %}
\begin{center}
    \textbf{Professional Summary}
\end{center}

{{ professionalSummary }}

\vspace{0.5cm}
{% endif %}

% ============ EXPERIENCE ============
\begin{center}
    \textbf{Professional Experience}
\end{center}

{% for exp in experience %}
\textbf{{ exp.organization }} \hfill {{ exp.location }}{% if exp.remote %} (Remote){% endif %}\\
\textit{{ exp.title }} \hfill {{ exp.start }} -- {{ exp.end }}
\begin{itemize}[noitemsep, topsep=0pt]
{% for bullet in exp.bullets %}
    \item {{ bullet }}
{% endfor %}
\end{itemize}
\vspace{8pt}
{% endfor %}

% ============ EDUCATION ============
\begin{center}
    \textbf{Education}
\end{center}

{% for edu in education %}
\textbf{{ edu.school }} \hfill {{ edu.location }}\\
{{ edu.degree }}{% if edu.concentration %}, {{ edu.concentration }}{% endif %} \hfill {{ edu.graduation_date }}
{% if edu.gpa %}GPA: {{ edu.gpa }}{% endif %}
{% if edu.coursework or edu.awards %}
\\Coursework: {{ edu.coursework | join(", ") }}{% if edu.awards %} | Awards: {{ edu.awards | join(", ") }}{% endif %}
{% endif %}
\vspace{8pt}
{% endfor %}

% ============ TECHNICAL SKILLS ============
{% if skills and skills.technical %}
\begin{center}
    \textbf{Technical Skills}
\end{center}

{% if skills.technical|length > 0 %}
{{ skills.technical | join(" • ") }}
{% endif %}
{% endif %}

% ============ PROJECTS (optional) ============
{% if projects and projects|length > 0 %}
\begin{center}
    \textbf{Selected Projects}
\end{center}

{% for proj in projects %}
\textbf{{ proj.title }} \hfill {{ proj.start }} -- {{ proj.end }}
\begin{itemize}[noitemsep, topsep=0pt]
{% for bullet in proj.bullets %}
    \item {{ bullet }}
{% endfor %}
\end{itemize}
\vspace{8pt}
{% endfor %}
{% endif %}

\end{document}
```

#### B. Professional Summary Generator Service

**File:** `src/services/professional-summary-service.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMUtilsService } from './llm-utils-service';
import type { Component } from '@/lib/supabase';
import type { JDMatchingResults, MatchResult } from '@/lib/types/jd-matching';
import type { SeniorityLevel } from './seniority-analysis-service';

/**
 * Professional Summary Generator
 * Creates HR-optimized professional summaries based on matched components
 */
export class ProfessionalSummaryService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Generate professional summary from matched components
   *
   * HR expects summaries to include:
   * 1. Current role/title + years of experience
   * 2. Core competencies (top 3-5 skills)
   * 3. Key achievements (quantified if possible)
   * 4. Career objective aligned with target role
   */
  static async generateFromMatches(
    matches: MatchResult[],
    jdMetadata: JDMatchingResults['jdMetadata'],
    seniorityLevel?: SeniorityLevel
  ): Promise<string> {
    try {
      console.log('📝 Generating professional summary...');

      // Get top matched components
      const topExperiences = matches
        .filter(m => m.cvComponent?.type === 'experience' && m.score >= 60)
        .slice(0, 3)
        .map(m => m.cvComponent!);

      const topSkills = matches
        .filter(m => m.cvComponent?.type === 'skill' && m.score >= 60)
        .slice(0, 8)
        .map(m => m.cvComponent!);

      const topProjects = matches
        .filter(m => m.cvComponent?.type === 'project' && m.score >= 60)
        .slice(0, 2)
        .map(m => m.cvComponent!);

      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are a professional CV writer specializing in creating compelling professional summaries that pass ATS and impress HR managers.

TARGET JOB:
Title: ${jdMetadata.title}
Company: ${jdMetadata.company}
${jdMetadata.seniorityLevel ? `Level: ${jdMetadata.seniorityLevel}` : ''}

CANDIDATE'S TOP MATCHED EXPERIENCE:
${topExperiences.map((exp, i) => `${i + 1}. ${exp.title} at ${exp.organization || 'Company'}
   Duration: ${exp.start_date || 'Date'} - ${exp.end_date || 'Present'}
   Key highlights: ${exp.highlights.slice(0, 3).join('; ')}`).join('\n\n')}

CANDIDATE'S TOP SKILLS:
${topSkills.map(s => `- ${s.title}: ${s.description || ''}`).join('\n')}

${topProjects.length > 0 ? `NOTABLE PROJECTS:\n${topProjects.map(p => `- ${p.title}: ${p.description || ''}`).join('\n')}` : ''}

SENIORITY LEVEL: ${seniorityLevel || 'Not specified'}

TASK:
Write a professional summary (2-3 sentences, max 80 words) that:

1. **Starts with current/most recent role + total years of experience**
   Example: "Senior Software Engineer with 8+ years of experience..."

2. **Highlights top 3-5 core competencies relevant to target job**
   Focus on: skills that appeared in both JD and CV

3. **Includes 1-2 quantified achievements** (if data available)
   Example: "Led teams that delivered X projects serving Y users"

4. **Ends with career objective aligned with target role**
   Example: "Seeking to leverage expertise in [skills] to drive [company goal]"

HR BEST PRACTICES:
- Use action verbs (Led, Architected, Drove, Designed)
- Include metrics when possible (X years, Y% improvement, Z users)
- Avoid buzzwords without substance (synergy, rockstar, ninja)
- Match terminology from job description
- Sound confident but not arrogant

Return ONLY the professional summary text (no JSON, no formatting, just plain text).`;

      const summary = await LLMUtilsService.callWithRetry<string>(model, prompt, {
        maxRetries: 2,
        parseJSON: false,
        validator: (text: string) => {
          // Validate length (50-120 words)
          const wordCount = text.trim().split(/\s+/).length;
          if (wordCount < 30 || wordCount > 150) {
            console.warn(`Summary length out of range: ${wordCount} words`);
            return false;
          }
          return true;
        },
        validatorErrorMessage: 'Summary must be 30-150 words',
      });

      console.log(`✅ Professional summary generated (${summary.split(/\s+/).length} words)`);
      return summary.trim();
    } catch (error: any) {
      console.error('❌ Error generating summary:', error.message);

      // Fallback: Simple template-based summary
      const exp = matches.find(m => m.cvComponent?.type === 'experience');
      const skills = matches.filter(m => m.cvComponent?.type === 'skill').slice(0, 5);

      return `Experienced professional with background in ${exp?.cvComponent?.title || 'software development'}. ` +
             `Proficient in ${skills.map(s => s.cvComponent!.title).join(', ')}. ` +
             `Seeking to contribute expertise to ${jdMetadata.company} as ${jdMetadata.title}.`;
    }
  }

  /**
   * Generate professional summary from raw components (no matching)
   */
  static async generateFromComponents(
    experiences: Component[],
    skills: Component[],
    targetRole: string,
    targetCompany?: string
  ): Promise<string> {
    // Calculate total years of experience
    const totalYears = this.calculateTotalYears(experiences);

    // Get current/most recent role
    const currentRole = experiences.sort((a, b) => {
      const aDate = new Date(a.end_date || new Date());
      const bDate = new Date(b.end_date || new Date());
      return bDate.getTime() - aDate.getTime();
    })[0];

    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Write a professional summary (2-3 sentences) for a CV:

Current Role: ${currentRole?.title || 'Professional'}
Total Experience: ${totalYears} years
Top Skills: ${skills.slice(0, 8).map(s => s.title).join(', ')}
Target Role: ${targetRole}
${targetCompany ? `Target Company: ${targetCompany}` : ''}

Follow professional CV summary best practices. Return only the text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  /**
   * Calculate total years from experiences
   */
  private static calculateTotalYears(experiences: Component[]): number {
    let totalMonths = 0;

    for (const exp of experiences) {
      if (!exp.start_date) continue;
      const start = new Date(exp.start_date);
      const end = exp.end_date ? new Date(exp.end_date) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 +
                     (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }

    return Math.round(totalMonths / 12);
  }
}
```

#### C. Update CV Generation API

**File:** `src/app/api/cv/generate-from-matches/route.ts` (modifications)

```typescript
// Add after line 85
import { ProfessionalSummaryService } from '@/services/professional-summary-service';

// Replace generateOptimizedCVContent function:
async function generateOptimizedCVContent(
  profile: any,
  componentsByType: {...},
  jdMetadata: JDMatchingResults['jdMetadata']
): Promise<any> {
  // ... existing code ...

  // Generate professional summary
  const professionalSummary = await ProfessionalSummaryService.generateFromMatches(
    [...componentsByType.experience, ...componentsByType.skill, ...componentsByType.project],
    jdMetadata,
    jdMetadata.seniorityLevel
  );

  // Add to prompt
  const prompt = `... (existing prompt) ...

PROFESSIONAL SUMMARY (pre-generated):
${professionalSummary}

Include this summary in the CV output. You can refine it slightly but keep the core message.

Output format:
{
  "professionalSummary": "${professionalSummary}",
  "profile": {...},
  "experience": [...],
  ...
}`;

  // ... rest of code ...
}
```

### Pros & Cons

**Pros:**
- ✅ Complete component coverage (experience, education, skills, projects)
- ✅ HR-optimized professional summary với quantified achievements
- ✅ Backward compatible với existing workflow
- ✅ Sử dụng seniority analysis đã có
- ✅ Template flexibility (có thể switch giữa có/không có summary)

**Cons:**
- ❌ Thêm 1 LLM call → latency +500-1000ms
- ❌ Template mới cần testing với nhiều layouts
- ❌ Không giải quyết edit workflow

### Implementation Effort

- **Complexity:** Medium
- **Time:** 4-6 hours
- **Files to create:** 2 (professional-summary-service.ts, resume-with-summary.tex.njk)
- **Files to modify:** 2 (generate-from-matches/route.ts, latex-service.ts)
- **Testing:** 6-8 test cases

### Rating: ⭐⭐⭐⭐⭐ (9/10)

**Justification:**
- Giải quyết vấn đề core nhất: Professional summary thiếu
- Impact cao với effort vừa phải
- Foundation tốt cho Solution 2 & 3

---

## SOLUTION 2: Interactive CV Editor with Component Drag-and-Drop ⭐⭐⭐⭐

### Overview
Implement full-featured CV editor theo Epics 2.3 & 2.4, cho phép user customize matched components trước khi generate PDF.

### Architecture

```
┌─────────────────────────────────┐
│ JD Matching Results             │
│ - matches[]                     │
│ - jdMetadata                    │
│ - seniorityAnalysis             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│ CV EDITOR (Two-Panel Layout)                   │
│ ┌───────────────────┬─────────────────────────┐│
│ │ LEFT: CV PREVIEW  │ RIGHT: COMPONENT LIBRARY││
│ │                   │                         ││
│ │ □ Summary         │ 🔍 Search components    ││
│ │ □ Experience (3)  │                         ││
│ │   - Item 1 ✏️❌   │ ✅ Experience (5 items) ││
│ │   - Item 2 ✏️❌   │   → Backend Dev (85%)  ││
│ │   - Item 3 ✏️❌   │   → Frontend Dev (72%) ││
│ │ □ Education (2)   │   → DevOps Eng (45%)   ││
│ │ □ Skills (8)      │                         ││
│ │ □ Projects (2)    │ ✅ Skills (12 items)    ││
│ │                   │   → React (90%)         ││
│ │ [Generate PDF]    │   → Node.js (85%)       ││
│ └───────────────────┴─────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Implementation Details

#### A. CV Editor State Management

**File:** `src/app/editor/from-matching/page.tsx` (enhancement)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { JDMatchingResults, MatchResult } from '@/lib/types/jd-matching'
import type { Component } from '@/lib/supabase'

interface CVEditorState {
  professionalSummary: string
  selectedExperiences: MatchResult[]
  selectedEducation: MatchResult[]
  selectedSkills: MatchResult[]
  selectedProjects: MatchResult[]
}

export default function CVEditorFromMatching() {
  const router = useRouter()
  const [matchingResults, setMatchingResults] = useState<JDMatchingResults | null>(null)
  const [editorState, setEditorState] = useState<CVEditorState>({
    professionalSummary: '',
    selectedExperiences: [],
    selectedEducation: [],
    selectedSkills: [],
    selectedProjects: [],
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [matchScore, setMatchScore] = useState(0)

  // Load matching results from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('jd-matching-editor-data')
    if (!stored) {
      router.push('/jd/match')
      return
    }

    try {
      const { matchingResults: results } = JSON.parse(stored)
      setMatchingResults(results)

      // Auto-populate with good matches (score >= 60)
      const goodMatches = results.matches.filter((m: MatchResult) => m.score >= 60)

      setEditorState({
        professionalSummary: '', // Will be generated
        selectedExperiences: goodMatches.filter((m: MatchResult) => m.cvComponent?.type === 'experience').slice(0, 4),
        selectedEducation: goodMatches.filter((m: MatchResult) => m.cvComponent?.type === 'education').slice(0, 2),
        selectedSkills: goodMatches.filter((m: MatchResult) => m.cvComponent?.type === 'skill').slice(0, 10),
        selectedProjects: goodMatches.filter((m: MatchResult) => m.cvComponent?.type === 'project').slice(0, 3),
      })

      // Calculate initial match score
      calculateMatchScore(goodMatches.length, results.matches.length)
    } catch (error) {
      console.error('Failed to load matching data:', error)
      router.push('/jd/match')
    }
  }, [router])

  // Generate professional summary when components change
  useEffect(() => {
    if (editorState.selectedExperiences.length > 0 && !editorState.professionalSummary) {
      generateProfessionalSummary()
    }
  }, [editorState.selectedExperiences])

  const generateProfessionalSummary = async () => {
    if (!matchingResults) return

    try {
      const response = await fetch('/api/cv/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: [...editorState.selectedExperiences, ...editorState.selectedSkills],
          jdMetadata: matchingResults.jdMetadata,
          seniorityLevel: matchingResults.seniorityAnalysis?.userLevel,
        }),
      })

      const { summary } = await response.json()
      setEditorState(prev => ({ ...prev, professionalSummary: summary }))
    } catch (error) {
      console.error('Failed to generate summary:', error)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // Moving within same list
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(editorState[source.droppableId as keyof CVEditorState] as MatchResult[])
      const [reordered] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reordered)

      setEditorState(prev => ({
        ...prev,
        [source.droppableId]: items,
      }))
    } else {
      // Moving from library to CV or vice versa
      // Implementation details...
    }

    // Recalculate match score
    recalculateMatchScore()
  }

  const recalculateMatchScore = () => {
    const totalSelected =
      editorState.selectedExperiences.length +
      editorState.selectedEducation.length +
      editorState.selectedSkills.length +
      editorState.selectedProjects.length

    const totalAvailable = matchingResults?.matches.length || 0
    const avgScore =
      [...editorState.selectedExperiences, ...editorState.selectedEducation,
       ...editorState.selectedSkills, ...editorState.selectedProjects]
      .reduce((sum, m) => sum + m.score, 0) / totalSelected

    setMatchScore(Math.round(avgScore))
  }

  const handleGeneratePDF = async () => {
    if (!matchingResults) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/cv/generate-from-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalSummary: editorState.professionalSummary,
          selectedComponents: {
            experiences: editorState.selectedExperiences,
            education: editorState.selectedEducation,
            skills: editorState.selectedSkills,
            projects: editorState.selectedProjects,
          },
          jdMetadata: matchingResults.jdMetadata,
        }),
      })

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${matchingResults.jdMetadata.company}_${matchingResults.jdMetadata.title}_Customized.pdf`
      a.click()
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!matchingResults) return <div>Loading...</div>

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-6 h-screen p-6">
        {/* LEFT PANEL: CV Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Your CV</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Match Score:</div>
              <div className="text-3xl font-bold text-blue-600">{matchScore}%</div>
            </div>
          </div>

          {/* Professional Summary */}
          <section className="mb-6">
            <h3 className="font-bold text-lg mb-2">Professional Summary</h3>
            <textarea
              value={editorState.professionalSummary}
              onChange={(e) => setEditorState(prev => ({ ...prev, professionalSummary: e.target.value }))}
              className="w-full h-24 p-2 border rounded"
              placeholder="Edit your professional summary..."
            />
          </section>

          {/* Experience Section */}
          <Droppable droppableId="selectedExperiences">
            {(provided) => (
              <section ref={provided.innerRef} {...provided.droppableProps} className="mb-6">
                <h3 className="font-bold text-lg mb-2">Experience ({editorState.selectedExperiences.length})</h3>
                {editorState.selectedExperiences.map((match, index) => (
                  <Draggable key={match.jdComponent.id} draggableId={match.jdComponent.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-3 mb-2 bg-gray-50 rounded border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{match.cvComponent!.title}</div>
                            <div className="text-sm text-gray-600">{match.cvComponent!.organization}</div>
                          </div>
                          <div className="text-sm text-blue-600">{match.score}% match</div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </section>
            )}
          </Droppable>

          {/* Similar sections for Education, Skills, Projects */}

          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>

        {/* RIGHT PANEL: Component Library */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Component Library</h2>

          {/* Available components grouped by type with drag functionality */}
          {/* Implementation details... */}
        </div>
      </div>
    </DragDropContext>
  )
}
```

#### B. New API Endpoint for Editor

**File:** `src/app/api/cv/generate-from-editor/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LaTeXService } from '@/services/latex-service';
import type { MatchResult } from '@/lib/types/jd-matching';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { professionalSummary, selectedComponents, jdMetadata } = body;

  // Build CV data from selected components
  const cvData = {
    professionalSummary,
    profile: {
      name: 'User Name', // Get from auth
      email: 'email@example.com',
      phone: '(000) 000-0000',
      address: 'City, Country',
      city_state_zip: 'City, Country',
    },
    margins: LaTeXService.getDefaultMargins(),
    experience: selectedComponents.experiences.map((m: MatchResult) => ({
      title: m.cvComponent!.title,
      organization: m.cvComponent!.organization,
      location: 'Location', // Extract from component
      remote: false,
      start: m.cvComponent!.start_date,
      end: m.cvComponent!.end_date || 'Present',
      bullets: m.cvComponent!.highlights,
    })),
    education: selectedComponents.education.map((m: MatchResult) => ({
      school: m.cvComponent!.organization,
      degree: m.cvComponent!.title,
      concentration: '',
      location: 'Location',
      graduation_date: m.cvComponent!.end_date,
      gpa: '',
      coursework: [],
      awards: [],
    })),
    skills: {
      technical: selectedComponents.skills.map((m: MatchResult) => m.cvComponent!.title),
      languages: [],
      interests: [],
    },
    projects: selectedComponents.projects.map((m: MatchResult) => ({
      title: m.cvComponent!.title,
      organization: m.cvComponent!.organization || 'Personal',
      location: '',
      start: m.cvComponent!.start_date,
      end: m.cvComponent!.end_date,
      bullets: m.cvComponent!.highlights,
    })),
  };

  // Generate PDF
  const latexContent = await LaTeXService.renderTemplate('resume-with-summary.tex.njk', cvData);
  const pdfBuffer = await LaTeXService.generatePDFOnline(latexContent);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CV_Customized.pdf"`,
    },
  });
}
```

### Pros & Cons

**Pros:**
- ✅ Hoàn thành Epics 2.3 & 2.4
- ✅ User có full control over CV content
- ✅ Real-time match score feedback
- ✅ Drag-and-drop intuitive UX
- ✅ Preview before download

**Cons:**
- ❌ Complex implementation (drag-drop state management)
- ❌ Requires new dependencies (@hello-pangea/dnd)
- ❌ High development effort
- ❌ Potential performance issues với large component libraries

### Implementation Effort

- **Complexity:** High
- **Time:** 12-16 hours
- **Files to create:** 3 (editor page, generate-from-editor API, CV preview component)
- **Files to modify:** 2 (jd-matching-page.tsx navigation, package.json dependencies)
- **Testing:** 15+ test cases

### Rating: ⭐⭐⭐⭐ (8/10)

**Justification:**
- Giải quyết toàn diện edit workflow
- Effort cao nhưng align với product roadmap
- UX improvement lớn

---

## SOLUTION 3: Smart CV Variant Generator with A/B Testing ⭐⭐⭐⭐⭐

### Overview
Thay vì 1 CV cố định, generate multiple CV variants optimized cho different angles của same JD. User chọn variant phù hợp nhất.

### Architecture

```
┌─────────────────────────────────┐
│ JD Matching Complete            │
│ - Overall Score: 75%            │
│ - Top Skills: React, Node, AWS  │
│ - Seniority: Senior             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ SMART VARIANT GENERATOR                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Analyze JD Focus Areas:                         │ │
│ │ - Technical Depth (70%) → Variant A            │ │
│ │ - Leadership/Management (20%) → Variant B      │ │
│ │ - Full-Stack Breadth (10%) → Variant C         │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Generate 3 Variants in Parallel:               │ │
│ │                                                 │ │
│ │ VARIANT A: Technical Expert                    │ │
│ │ - Summary: Deep technical expertise focus      │ │
│ │ - Experience: Technical achievements first     │ │
│ │ - Skills: Detailed tech stack                  │ │
│ │                                                 │ │
│ │ VARIANT B: Technical Leader                    │ │
│ │ - Summary: Leadership + technical balance      │ │
│ │ - Experience: Team/project leadership         │ │
│ │ - Skills: Technologies + soft skills           │ │
│ │                                                 │ │
│ │ VARIANT C: Full-Stack Generalist              │ │
│ │ - Summary: Breadth of experience              │ │
│ │ - Experience: Diverse projects                 │ │
│ │ - Skills: Wide range of technologies          │ │
│ └─────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ USER SELECTS BEST VARIANT                           │
│ ┌────────┐  ┌────────┐  ┌────────┐                 │
│ │ Variant│  │ Variant│  │ Variant│                 │
│ │   A    │  │   B    │  │   C    │                 │
│ │  [85%] │  │  [78%] │  │  [72%] │                 │
│ └────────┘  └────────┘  └────────┘                 │
│                                                     │
│ [Download Selected] [Customize in Editor]          │
└─────────────────────────────────────────────────────┘
```

### Implementation Details

#### A. Variant Generator Service

**File:** `src/services/cv-variant-generator-service.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMUtilsService } from './llm-utils-service';
import { ProfessionalSummaryService } from './professional-summary-service';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';

export interface CVVariant {
  id: string;
  name: string;
  description: string;
  focusArea: 'technical' | 'leadership' | 'generalist';
  professionalSummary: string;
  selectedExperiences: MatchResult[];
  selectedSkills: MatchResult[];
  selectedProjects: MatchResult[];
  estimatedMatchScore: number;
}

export class CVVariantGeneratorService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found');
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Analyze JD to determine what variants to generate
   */
  static async analyzeJDFocus(jdMetadata: JDMatchingResults['jdMetadata']): Promise<{
    technicalWeight: number;
    leadershipWeight: number;
    generalistWeight: number;
  }> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this job description and determine the weight of different focus areas:

JD Title: ${jdMetadata.title}
JD Company: ${jdMetadata.company}
JD Description: ${jdMetadata.description}

Determine weights (must sum to 100):
1. **Technical Depth** - Focus on deep technical expertise, specific technologies
2. **Leadership/Management** - Focus on team leadership, mentoring, project management
3. **Generalist Breadth** - Focus on diverse skills, adaptability, full-stack

Return JSON:
{
  "technicalWeight": 70,
  "leadershipWeight": 20,
  "generalistWeight": 10,
  "reasoning": "Why these weights..."
}`;

    const result = await LLMUtilsService.callWithRetry(model, prompt, {
      parseJSON: true,
      maxRetries: 2,
    });

    return result;
  }

  /**
   * Generate multiple CV variants optimized for different angles
   */
  static async generateVariants(
    matchingResults: JDMatchingResults
  ): Promise<CVVariant[]> {
    console.log('🎨 Generating CV variants...');

    // Analyze JD focus
    const focusWeights = await this.analyzeJDFocus(matchingResults.jdMetadata);

    // Determine which variants to generate (generate top 2-3 by weight)
    const variantsToGenerate: Array<'technical' | 'leadership' | 'generalist'> = [];

    if (focusWeights.technicalWeight >= 30) variantsToGenerate.push('technical');
    if (focusWeights.leadershipWeight >= 20) variantsToGenerate.push('leadership');
    if (focusWeights.generalistWeight >= 20) variantsToGenerate.push('generalist');

    // Generate variants in parallel
    const variants = await Promise.all(
      variantsToGenerate.map(focusArea =>
        this.generateSingleVariant(matchingResults, focusArea, focusWeights)
      )
    );

    console.log(`✅ Generated ${variants.length} variants`);
    return variants;
  }

  /**
   * Generate a single variant optimized for specific focus area
   */
  private static async generateSingleVariant(
    matchingResults: JDMatchingResults,
    focusArea: 'technical' | 'leadership' | 'generalist',
    focusWeights: any
  ): Promise<CVVariant> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Filter and rank components based on focus area
    const allMatches = matchingResults.matches.filter(m => m.score >= 40);

    const prompt = `You are creating a CV variant optimized for "${focusArea}" focus.

JD: ${matchingResults.jdMetadata.title} at ${matchingResults.jdMetadata.company}
Available matched components: ${allMatches.length}

FOCUS AREA OPTIMIZATION:

${focusArea === 'technical' ? `
TECHNICAL EXPERT VARIANT:
- Prioritize: Deep technical achievements, complex problem-solving, technology expertise
- Experience bullets: Technical implementations, architecture decisions, performance improvements
- Skills: Detailed tech stack, frameworks, tools
- Summary tone: Technical authority, depth of expertise
` : ''}

${focusArea === 'leadership' ? `
LEADERSHIP VARIANT:
- Prioritize: Team management, mentoring, project delivery, stakeholder communication
- Experience bullets: Team size, projects delivered, cross-functional collaboration
- Skills: Technologies + leadership/soft skills
- Summary tone: Leadership capability, people management
` : ''}

${focusArea === 'generalist' ? `
GENERALIST VARIANT:
- Prioritize: Diverse experiences, adaptability, full-stack capabilities
- Experience bullets: Breadth of responsibilities, varied projects
- Skills: Wide range of technologies and domains
- Summary tone: Versatility, quick learner
` : ''}

Available components:
${allMatches.slice(0, 20).map(m => `- [${m.score}%] ${m.cvComponent!.title} (${m.cvComponent!.type})`).join('\n')}

Task: Select top 8-12 components that best fit this variant's focus. Return component IDs.

Return JSON:
{
  "selectedComponentIds": ["id1", "id2", ...],
  "reasoning": "Why these selections fit the ${focusArea} focus"
}`;

    const selection = await LLMUtilsService.callWithRetry(model, prompt, {
      parseJSON: true,
      maxRetries: 2,
    });

    // Filter selected components
    const selectedMatches = allMatches.filter(m =>
      selection.selectedComponentIds.includes(m.jdComponent.id)
    );

    // Generate professional summary for this variant
    const summary = await ProfessionalSummaryService.generateFromMatches(
      selectedMatches,
      matchingResults.jdMetadata,
      matchingResults.seniorityAnalysis?.userLevel
    );

    // Calculate estimated match score
    const avgScore = selectedMatches.reduce((sum, m) => sum + m.score, 0) / selectedMatches.length;

    return {
      id: `variant-${focusArea}`,
      name: this.getVariantName(focusArea),
      description: this.getVariantDescription(focusArea),
      focusArea,
      professionalSummary: summary,
      selectedExperiences: selectedMatches.filter(m => m.cvComponent?.type === 'experience'),
      selectedSkills: selectedMatches.filter(m => m.cvComponent?.type === 'skill'),
      selectedProjects: selectedMatches.filter(m => m.cvComponent?.type === 'project'),
      estimatedMatchScore: Math.round(avgScore),
    };
  }

  private static getVariantName(focusArea: string): string {
    switch (focusArea) {
      case 'technical': return 'Technical Expert';
      case 'leadership': return 'Technical Leader';
      case 'generalist': return 'Full-Stack Generalist';
      default: return 'Balanced';
    }
  }

  private static getVariantDescription(focusArea: string): string {
    switch (focusArea) {
      case 'technical':
        return 'Emphasizes deep technical expertise, complex problem-solving, and technology mastery';
      case 'leadership':
        return 'Highlights leadership experience, team management, and project delivery';
      case 'generalist':
        return 'Showcases diverse skills, adaptability, and full-stack capabilities';
      default:
        return 'Balanced approach';
    }
  }
}
```

#### B. Variant Selection UI

**File:** `src/components/cv-variant-selector.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Edit, ChevronRight } from 'lucide-react'
import type { CVVariant } from '@/services/cv-variant-generator-service'

interface CVVariantSelectorProps {
  variants: CVVariant[]
  onSelectVariant: (variant: CVVariant) => void
  onCustomize: (variant: CVVariant) => void
}

export function CVVariantSelector({ variants, onSelectVariant, onCustomize }: CVVariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your CV Variant</h2>
        <p className="text-gray-400">
          We've generated {variants.length} optimized versions based on different angles of the JD
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-${variants.length} gap-6">
        {variants.map((variant) => (
          <Card
            key={variant.id}
            className={`cursor-pointer transition-all ${
              selectedId === variant.id
                ? 'border-blue-500 border-2 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 hover:border-gray-600'
            } bg-gray-800`}
            onClick={() => setSelectedId(variant.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{variant.name}</CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    {variant.description}
                  </CardDescription>
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {variant.estimatedMatchScore}% match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Professional Summary Preview */}
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Summary Preview:</div>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {variant.professionalSummary}
                </p>
              </div>

              {/* Component Counts */}
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Experience:</span>{' '}
                  <span className="text-white font-medium">{variant.selectedExperiences.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Skills:</span>{' '}
                  <span className="text-white font-medium">{variant.selectedSkills.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Projects:</span>{' '}
                  <span className="text-white font-medium">{variant.selectedProjects.length}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedId === variant.id && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => onSelectVariant(variant)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => onCustomize(variant)}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### C. Update Matching Page

**File:** `src/components/jd-matching-page.tsx` (add variant generation)

```typescript
// After line 187 (after results are set)
// Generate variants
const variantResponse = await fetch('/api/cv/generate-variants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ matchingResults: data.results }),
})

const { variants } = await variantResponse.json()
setVariants(variants)
```

### Pros & Cons

**Pros:**
- ✅ **Differentiation:** Unique feature không có ở competitors
- ✅ **Better conversion:** User có nhiều options, tăng satisfaction
- ✅ **Data insights:** Track variant selection để improve algorithm
- ✅ **Scalable:** Có thể extend thành A/B testing framework
- ✅ **Low friction:** User không cần manually configure

**Cons:**
- ❌ **Complexity:** Cao nhất trong 3 solutions
- ❌ **Cost:** 3x LLM calls per matching
- ❌ **Latency:** +2-3s generation time
- ❌ **Confusion risk:** Too many choices có thể overwhelm users

### Implementation Effort

- **Complexity:** Very High
- **Time:** 16-20 hours
- **Files to create:** 4 (variant generator service, selector component, variants API, analytics)
- **Files to modify:** 3 (matching page, generate route, database schema)
- **Testing:** 20+ test cases

### Rating: ⭐⭐⭐⭐⭐ (9.5/10)

**Justification:**
- Highest product value
- Competitive advantage
- Foundation for future ML improvements
- Aligns with "Magic" brand promise

---

## BEST PRACTICES & RECOMMENDATIONS

### Recommended Implementation Order:

**Phase 1 (Week 1): Foundation**
1. ✅ Solution 1 (Professional Summary) - **PRIORITY**
   - Giải quyết vấn đề core nhất
   - Foundation cho các solutions khác
   - Low risk, medium effort

**Phase 2 (Week 2-3): User Experience**
2. ✅ Solution 2 (Interactive Editor) - **NICE TO HAVE**
   - Complete Epics 2.3 & 2.4
   - Improve user engagement
   - Enable customization workflow

**Phase 3 (Week 4+): Differentiation**
3. ✅ Solution 3 (Variant Generator) - **FUTURE**
   - Market differentiation
   - Requires Phase 1 complete
   - Analytics-driven improvements

### Technical Best Practices:

**1. LaTeX Template Management:**
```typescript
// Create template registry
const CV_TEMPLATES = {
  'basic': 'resume.tex.njk',
  'with-summary': 'resume-with-summary.tex.njk',
  'modern': 'resume-modern.tex.njk',
}

// Allow template selection
interface CVGenerationOptions {
  template?: keyof typeof CV_TEMPLATES
  includeProjects?: boolean
  includeSummary?: boolean
}
```

**2. Component Mapping Layer:**
```typescript
// Centralize component → LaTeX data mapping
class ComponentMapper {
  static toExperience(component: Component): LaTeXExperience {
    return {
      title: component.title,
      organization: component.organization || 'Company',
      location: this.extractLocation(component),
      remote: this.isRemote(component),
      start: this.formatDate(component.start_date),
      end: component.end_date ? this.formatDate(component.end_date) : 'Present',
      bullets: this.optimizeBullets(component.highlights),
    }
  }
}
```

**3. Caching Strategy:**
```typescript
// Cache expensive operations
class CVGenerationCache {
  // Cache professional summaries (24h TTL)
  static summaryCache = new Map<string, { summary: string; timestamp: number }>()

  // Cache variant analysis (1h TTL)
  static variantCache = new Map<string, CVVariant[]>()
}
```

**4. Analytics Integration:**
```typescript
// Track user preferences
interface CVGenerationEvent {
  userId: string
  jdId: string
  action: 'generate' | 'customize' | 'download'
  variantSelected?: string
  matchScore: number
  timestamp: Date
}

class CVAnalytics {
  static track(event: CVGenerationEvent) {
    // Send to analytics service
  }
}
```

### Data Quality Improvements:

**1. Component Validation:**
```typescript
interface ComponentQualityScore {
  hasQuantifiedAchievements: boolean // "increased by 30%"
  hasActionVerbs: boolean // "Led", "Designed"
  hasTechnicalDetails: boolean
  lengthScore: number
}

class ComponentQualityChecker {
  static assess(component: Component): ComponentQualityScore {
    // Validate and score component quality
  }
}
```

**2. Professional Summary Templates:**
```typescript
const SUMMARY_TEMPLATES = {
  technical: '{role} with {years}+ years specializing in {top_skills}. {key_achievement}. {objective}',
  leadership: '{role} with {years}+ years leading {team_info}. {key_achievement}. {objective}',
  generalist: 'Versatile {role} with {years}+ years across {domains}. {key_achievement}. {objective}',
}
```

### UX Best Practices:

**1. Progressive Disclosure:**
- Show summary → experience → education → skills progressively
- Don't overwhelm với all data at once

**2. Feedback Loops:**
- Real-time match score updates
- Component quality indicators
- Suggestion tooltips

**3. Error Recovery:**
- Auto-save editor state
- Graceful fallbacks for LLM failures
- Clear error messages

---

## FINAL RECOMMENDATION

### **Start with Solution 1, then add Solution 3**

**Rationale:**
1. **Solution 1** fixes critical gap (professional summary) with low risk
2. **Solution 3** provides competitive differentiation without editor complexity
3. **Solution 2** can be added later as enhancement

**Implementation Timeline:**

```
Week 1: Solution 1 (Professional Summary)
├── Day 1-2: ProfessionalSummaryService + tests
├── Day 3: Update LaTeX template
├── Day 4: Integrate with generate-from-matches API
└── Day 5: Testing & refinement

Week 2-3: Solution 3 (Variant Generator)
├── Week 2: CVVariantGeneratorService + focus analysis
├── Week 3 Day 1-3: Variant selection UI
├── Week 3 Day 4-5: Integration + analytics

Week 4+: Solution 2 (if needed)
└── Implement editor based on user feedback
```

**Expected Outcomes:**
- ✅ Complete CV generation với professional summary
- ✅ Multiple optimized variants per JD
- ✅ Foundation for ML improvements
- ✅ Competitive advantage in market
