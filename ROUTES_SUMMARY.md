# Tổng hợp Routes và Navigation Links

## 📄 Page Routes (User-Facing)

| Route | File | Có Link/Navigation | Link từ đâu | Ghi chú |
|-------|------|-------------------|-------------|---------|
| `/` | `app/page.tsx` | ✅ | Landing page | Link tới `/login` |
| `/login` | `app/login/page.tsx` | ✅ | Landing page, Auth page | Link tới `/dashboard` sau login |
| `/dashboard` | `app/dashboard/page.tsx` | ✅ | Main navigation | Link tới: `/library`, `/settings`, `/editor/[id]` |
| `/editor/[id]` | `app/editor/[id]/page.tsx` | ✅ | Dashboard (CV cards) | Link từ dashboard CV list, có back button |
| `/jd/upload` | `app/jd/upload/page.tsx` | ✅ | Dashboard button | Link từ dashboard "Upload JD" button + có back button |
| `/library` | `app/library/page.tsx` | ✅ | Dashboard nav | Link từ dashboard nav bar, có back button |
| `/settings` | `app/settings/page.tsx` | ✅ | Dashboard nav | Link từ dashboard nav bar, có back button |
| `/upgrade` | `app/upgrade/page.tsx` | ✅ | Settings page | Link từ settings page |
| `/onboarding` | `app/onboarding/page.tsx` | ⚠️ | Redirect | Chỉ redirect programmatic, không có direct link |
| `/auth` | `app/auth/page.tsx` | ✅ | Various | Link từ landing, auth flow |
| `/auth/onboarding` | `app/auth/onboarding/page.tsx` | ❌ | Redirect only | Chỉ redirect programmatic |
| `/auth/auth-code-error` | `app/auth/auth-code-error/page.tsx` | ✅ | Error handling | Link tới `/auth` và `/` |

## 🔌 API Routes (Backend)

### CV & Job Description Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/cv/generate` | POST | `api/cv/generate/route.ts` | Generate CV from JD |
| `/api/cv/[id]` | GET, DELETE | `api/cv/[id]/route.ts` | Get/Delete CV |
| `/api/cv/match` | POST | `api/cv/match/route.ts` | Match CV with JD |
| `/api/cvs` | GET | `api/cvs/route.ts` | Get all CVs |
| `/api/jd/extract` | POST, GET | `api/jd/extract/route.ts` | Extract JD components from PDF |
| `/api/job-descriptions/upload` | POST | `api/job-descriptions/upload/route.ts` | Upload job description |
| `/api/job-descriptions/[userId]` | GET | `api/job-descriptions/[userId]/route.ts` | Get JDs by user |

### Component Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/components` | GET, POST | `api/components/route.ts` | Get/Create components |
| `/api/components/[id]` | GET, PUT, DELETE | `api/components/[id]/route.ts` | Component CRUD |
| `/api/components/user/[userId]` | GET | `api/components/user/[userId]/route.ts` | Get user components |
| `/api/search/components` | POST | `api/search/components/route.ts` | Search components |

### User & Auth Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/users` | GET, POST | `api/users/route.ts` | User management |
| `/api/users/[userId]` | GET, PUT, DELETE | `api/users/[userId]/route.ts` | User CRUD |
| `/api/auth/callback` | GET | `api/auth/callback/route.ts` | OAuth callback |
| `/api/copilotkit` | POST | `api/copilotkit/route.ts` | CopilotKit integration |

### Crawler Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/crawl/github` | POST | `api/crawl/github/route.ts` | Crawl GitHub profile |
| `/api/crawl/linkedin` | POST | `api/crawl/linkedin/route.ts` | Crawl LinkedIn profile |
| `/api/crawl/youtube` | POST | `api/crawl/youtube/route.ts` | Crawl YouTube channel |

### Utility Routes
| Route | Method | File | Purpose |
|-------|--------|------|---------|
| `/api/search/job-descriptions` | POST | `api/search/job-descriptions/route.ts` | Search JDs |
| `/api/stats` | GET | `api/stats/route.ts` | Get dashboard stats |
| `/api/health` | GET | `api/health/route.ts` | Health check |

## ✅ Đã Implement

1. **`/jd/upload`** - ✅ Đã thêm navigation
   - ✅ Button "Upload JD" trong dashboard (màu cam, bên cạnh "Generate CV")
   - ✅ Back button trong JD upload page để quay lại dashboard
   - ✅ Cập nhật description: "Upload a job description PDF or create a new CV"

2. **`/onboarding`** - Chưa có direct link
   - ⚠️ Chỉ redirect programmatic
   - 💡 **Cần thêm**: Có thể bỏ qua nếu chỉ dùng cho redirect

3. **`/auth/onboarding`** - Chưa có direct link
   - ⚠️ Chỉ redirect programmatic
   - 💡 **Có thể bỏ qua** - chỉ dùng cho auth flow

## 📊 Navigation Map

```
Landing Page (/)
  ├─> /login (Get Started button)
  └─> #demo (Watch Demo - anchor)

Login Page (/login)
  └─> /dashboard (after login)

Dashboard (/dashboard)
  ├─> /library (nav link)
  ├─> /settings (nav link) 
  ├─> /editor/[id] (CV cards)
  └─> /jd/upload (✅ Upload JD button)

Editor (/editor/[id])
  └─> /dashboard (back button)

Library (/library)
  └─> /dashboard (back button)

Settings (/settings)
  ├─> /dashboard (back button)
  └─> /upgrade (upgrade link)

Upgrade (/upgrade)
  └─> /dashboard (back button)

JD Upload (/jd/upload)
  ├─> /dashboard (✅ back button)
  └─> /editor/[id] (after upload - programmatic)
```

## 🔧 Đã Implement

1. ✅ **Đã thêm link tới `/jd/upload`**:
   - Button "Upload JD" (màu cam) trong dashboard, bên cạnh "Generate CV"
   - Back button trong JD upload page

## 💡 Đề xuất cải thiện tiếp theo (Optional)

1. **Thêm breadcrumb navigation**:
   - Editor page: Dashboard > CV Title
   - Library page: Dashboard > Library
   - Settings page: Dashboard > Settings

2. **Thêm direct link tới editor từ library**:
   - Nếu library có CV list, nên có link tới editor

3. **Kiểm tra mobile navigation**:
   - Đảm bảo tất cả links accessible trên mobile
   - Responsive layout cho buttons

