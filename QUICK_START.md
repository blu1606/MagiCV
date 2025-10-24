# ⚡ Quick Start Guide - CV Builder

Hướng dẫn nhanh để chạy dự án trong 5 phút!

## 🚀 Bước 1: Clone & Install (1 phút)

```bash
cd /Volumes/WorkSpace/VScode/agent-challenge
pnpm install
```

## 🔑 Bước 2: Lấy API Keys (3 phút)

### Google Gemini API (BẮT BUỘC)
1. Truy cập: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy key

### Supabase (BẮT BUỘC)
1. Truy cập: https://supabase.com
2. Tạo project mới
3. Vào Settings > API
4. Copy:
   - Project URL
   - anon key
   - service_role key

## ⚙️ Bước 3: Configure (.env.local)

Tạo file `.env.local`:

```bash
# Supabase (BẮT BUỘC)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini (BẮT BUỘC)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key

# LLM for agents (SỬ DỤNG MẶC ĐỊNH)
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnbw.node.k8s.prd.nos.ci/api
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# YouTube (OPTIONAL)
YOUTUBE_API_KEY=your-youtube-key
```

## 🗄️ Bước 4: Setup Database (2 phút)

1. Mở Supabase Dashboard > SQL Editor
2. Copy & run `src/lib/supabase-schema.sql`
3. Copy & run `src/lib/supabase-functions.sql`

## ▶️ Bước 5: Run!

```bash
# Terminal 1
pnpm run dev:agent

# Terminal 2  
pnpm run dev:ui
```

Hoặc:
```bash
pnpm run dev
```

## ✅ Test

```bash
./test-api.sh
```

## 🎯 Test thủ công

### 1. Tạo user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Crawl GitHub
```bash
curl -X POST http://localhost:3000/api/crawl/github \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_FROM_STEP_1","username":"nxc1802"}'
```

### 3. Upload JD PDF
```bash
curl -X POST http://localhost:3000/api/job-descriptions/upload \
  -F "file=@/path/to/job_description.pdf" \
  -F "userId=USER_ID"
```

### 4. Search
```bash
curl -X POST http://localhost:3000/api/search/components \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","query":"Python developer","limit":5}'
```

## 📡 Endpoints

- Health: http://localhost:3000/api/health
- UI: http://localhost:3000
- Mastra Agent: http://localhost:4111

## 🐛 Troubleshooting

### Lỗi Supabase connection
✅ Kiểm tra URL và keys trong `.env.local`  
✅ Verify project đang active

### Lỗi Gemini API
✅ Kiểm tra API key còn valid  
✅ Verify quota chưa hết

### Lỗi database
✅ Chạy lại schema & functions SQL  
✅ Kiểm tra pgvector extension enabled

## 📚 Đọc thêm

- **SETUP_GUIDE.md** - Chi tiết setup
- **CV_BUILDER_README.md** - Features & architecture
- **INTEGRATION_REPORT.md** - Technical details

---

**Bắt đầu ngay! 🚀**

