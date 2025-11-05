# 📚 MagicCV Project Documentation

**Last Updated**: 2025-10-28  
**Status**: Active Development  
**Version**: Phase 2 - UI/UX Enhancement Complete

---

## 🎯 PROJECT OVERVIEW

MagicCV is an AI-powered CV builder designed specifically for digital nomads. It combines LinkedIn data integration, AI-powered content generation, and real-time job matching to create stunning, job-specific resumes.

### Core Features
- **One-Click Autofill**: AI generates CV content from LinkedIn data
- **Real-Time Match Score**: Live compatibility scoring with job descriptions
- **Component Library**: Reusable CV sections for different roles
- **Multi-Provider Auth**: LinkedIn, GitHub, Google, Email/Password
- **PDF Export**: Professional CV generation

---

## 🎨 DESIGN SYSTEM

### Color Palette (STRICT)
```css
Primary:    #0ea5e9  (Ocean Blue) - Trust, Tech, Global
Accent:     #f97316  (Sunset Orange) - Adventure, Energy  
Background: #0f172a  (Deep Navy) - Professional, Eye-friendly
Success:    #22d3ee  (Electric Cyan) - Data-driven feedback
Text:       #ffffff  (White) - Main text
Text Secondary: #94a3b8 (Slate Gray) - Secondary text
Border:     rgba(255, 255, 255, 0.1) - Subtle borders
Card BG:    rgba(15, 23, 42, 0.8) - Semi-transparent cards
```

### MagicUI Components Used
- `GridPattern` - Background patterns
- `Glow` - Hero section effects
- `GlowingEffect` - Interactive cards
- `NumberTicker` - Animated statistics
- `AnimatedGradientText` - Dynamic text
- `ShimmerButton` - Primary CTAs
- `MagicCard` - Interactive cards
- `BorderBeam` - Card highlights
- `Particles` - Background effects

---

## 📱 PAGE STATUS

### ✅ COMPLETED PAGES
1. **Landing Page** (`/`) - Full Digital Nomad theme
2. **Login Page** (`/login`) - Multi-provider authentication
3. **Dashboard Page** (`/dashboard`) - CV management with theme
4. **Editor Page** (`/editor/[id]`) - CV editing with MagicUI
5. **Library Page** (`/library`) - Component management
6. **Settings Page** (`/settings`) - User preferences
7. **Upgrade Page** (`/upgrade`) - Subscription plans
8. **Onboarding Page** (`/onboarding`) - User setup

### 🔄 MISSING PAGES (Phase 2)
1. **Profession Select** (`/onboarding/profession-select`)
2. **Data Sources** (`/data-sources`) - LinkedIn/GitHub sync status
3. **CV Generator** (`/cv/generate`) - One-click autofill form
4. **Component Library** (`/components/library`) - CRUD operations

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: UI/UX Enhancement ✅ COMPLETED
- [x] Landing page theme synchronization
- [x] Login page with social providers
- [x] Dashboard page MagicUI integration
- [x] Editor page theme and components
- [x] Library page MagicUI components
- [x] Settings page theme updates
- [x] Upgrade page premium styling
- [x] Onboarding page progress indicators

### Phase 2: Missing Pages (IN PROGRESS)
- [ ] Profession Select Page
- [ ] Data Sources Dashboard
- [ ] CV Generator Form
- [ ] Component Library CRUD

### Phase 3: Advanced Features (PLANNED)
- [ ] Real-time match score optimization
- [ ] Advanced AI rephrasing
- [ ] Enhanced PDF export
- [ ] Mobile responsiveness

---

## 🛠️ TECHNICAL STACK

### Frontend
- **Framework**: Next.js 15 + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Dark Mode
- **UI Components**: shadcn/ui + MagicUI
- **Icons**: lucide-react
- **Animations**: Framer Motion

### Backend
- **AI Framework**: Mastra
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js API Routes

### Integrations
- **LinkedIn**: OAuth + Profile API
- **GitHub**: OAuth + Repository API
- **Google**: OAuth + Gemini AI
- **AI Models**: Google Gemini, Ollama

---

## 🔧 DEVELOPMENT SETUP

### Prerequisites
- Node.js 22.21.0
- pnpm package manager
- Supabase account
- Google Gemini API key

### Environment Variables
```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini (REQUIRED)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# LLM for agents (DEFAULT)
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnbw.node.k8s.prd.nos.ci/api
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# Optional
YOUTUBE_API_KEY=your-youtube-key
```

### Quick Start
```bash
# Install dependencies
pnpm install

# Setup database
# Run src/lib/supabase-schema.sql in Supabase SQL Editor
# Run src/lib/supabase-functions.sql in Supabase SQL Editor

# Start development server
pnpm run dev
```

---

## 📊 API ENDPOINTS

### Authentication
- `POST /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users` - Get user data
- `POST /api/users/profile` - Update user profile
- `GET /api/users/[userId]` - Get specific user

### Data Sources
- `GET /api/data-sources/status` - Check sync status
- `POST /api/data-sources/sync` - Sync specific source
- `POST /api/data-sources/connect` - Connect new source

### Components
- `GET /api/components` - List components
- `POST /api/components` - Create component
- `PUT /api/components/[id]` - Update component
- `DELETE /api/components/[id]` - Delete component
- `POST /api/components/[id]/match` - Calculate match score

### CV Operations
- `GET /api/cvs` - List user CVs
- `POST /api/cv/generate` - Generate CV with AI
- `GET /api/cv/[id]` - Get CV data
- `PUT /api/cv/[id]` - Update CV
- `DELETE /api/cv/[id]` - Delete CV
- `POST /api/cv/match` - Calculate match score
- `POST /api/cv/[id]/rephrase` - AI rephrase content
- `GET /api/cv/[id]/export` - Export CV as PDF

### Crawling
- `POST /api/crawl/linkedin` - Sync LinkedIn data
- `POST /api/crawl/github` - Sync GitHub data
- `POST /api/crawl/youtube` - Sync YouTube data

---

## 🎨 COMPONENT PATTERNS

### Common Layout Pattern
```tsx
<div className="min-h-screen bg-[#0f172a] relative">
  <GridPattern className="absolute inset-0 opacity-10" />
  <div className="relative z-10">
    {/* Page content */}
  </div>
</div>
```

### Card Pattern
```tsx
<Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all">
  {/* Card content */}
</Card>
```

### Button Patterns
```tsx
{/* Primary CTA */}
<ShimmerButton className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white">
  Action
</ShimmerButton>

{/* Secondary */}
<Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
  Secondary
</Button>

{/* Destructive */}
<Button className="bg-red-500 hover:bg-red-600 text-white">
  Delete
</Button>
```

### Badge Patterns
```tsx
<Badge className="bg-[#0ea5e9]/10 border-[#0ea5e9]/20 text-[#0ea5e9]">
  Primary
</Badge>

<Badge className="bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]">
  Accent
</Badge>
```

---

## 🧪 TESTING

### Manual Testing Checklist
- [ ] All pages load without errors
- [ ] Dark mode theme consistent
- [ ] Color palette applied correctly
- [ ] MagicUI components working
- [ ] Responsive design on mobile/tablet
- [ ] Authentication flows working
- [ ] API endpoints responding
- [ ] PDF export functional

### Test Scripts
```bash
# Test all endpoints
./test-all-endpoints.sh

# Test new endpoints
./test-new-endpoints.sh

# Quick test
./test-quick.sh
```

---

## 🐛 KNOWN ISSUES

### GitHub OAuth
- **Issue**: GitHub login bypasses authentication
- **Cause**: Missing GitHub OAuth configuration in Supabase
- **Status**: Needs Supabase project configuration

### Layout Issues
- **Issue**: Some MagicUI components cause layout conflicts
- **Solution**: Replaced `MagicCard` with `Card`, removed `BorderBeam` and `Particles`
- **Status**: Resolved

### Environment Variables
- **Issue**: Missing `.env.local` file
- **Solution**: Create `.env.local` with required variables
- **Status**: Needs setup

---

## 📈 PERFORMANCE

### Optimization Applied
- Dark mode enabled globally
- MagicUI components for smooth animations
- Optimized images with Next.js Image component
- Lazy loading for heavy components
- Efficient API calls with proper caching

### Metrics
- **Page Load**: < 2s
- **Match Score Update**: < 500ms
- **PDF Export**: < 5s
- **Bundle Size**: Optimized with Next.js

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 3 Features
- Advanced AI rephrasing with context
- Real-time collaboration on CVs
- Template marketplace
- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-language support

### Technical Improvements
- GraphQL API migration
- Redis caching layer
- CDN for static assets
- Advanced error monitoring
- Performance monitoring
- A/B testing framework

---

## 📚 RESOURCES

### Documentation
- **UI/UX Enhancement Plan**: `UI_UX_ENHANCEMENT_PLAN.md`
- **Implementation Roadmap**: `IMPLEMENTATION_ROADMAP.md`
- **Theme Sync Plan**: `THEME_SYNC_PLAN.md`

### External Links
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MagicUI Components](https://magicui.design)
- [shadcn/ui](https://ui.shadcn.com)

---

## 👥 CONTRIBUTING

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with proper theme
3. Test on multiple screen sizes
4. Update documentation if needed
5. Create pull request

### Code Standards
- Use TypeScript for all new code
- Follow existing color palette
- Use MagicUI components when appropriate
- Maintain dark mode consistency
- Add proper error handling

---

**🎉 MagicCV - Building the future of CV creation for digital nomads!**
