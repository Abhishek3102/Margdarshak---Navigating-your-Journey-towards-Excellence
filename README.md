# Margdarshak - Navigating Your Journey Towards Excellence

> AI-driven LMS: diagnostic baseline, Gemini quiz generation, Mem0 tutor, watch parties, Jira study plans.

Live: Vercel frontend + Render backend | Local: 3000 + 8000

## Contents

Section 1 What is This | 2 Features | 3 Roles | 4 Workflows | 5 HLD | 6 LLD | 7 Frontend | 8 Backend | 9 AI | 10 DB | 11 Realtime | 12 Security | 13 APIs | 14 Structure | 15 Setup | 16 Deploy | 17 Roadmap

## 1. What is This?

Diagnostic-first LMS. Register > Diagnostic (grade-1 bank + Gemini) > Mem0 memory. Teacher builds Standard>Subject>Chapter>Video, uploads to Cloudinary, AI Quiz via Gemini Flash-Lite. Student async or Watch Party (WS+WebRTC+sync player), Socratic hints, AI Scribe report, Jira ticket linked to quiz_results. Tutor recalls all via Mem0. Plus Blogs, Feedback, Notifications, Admin.
## 2. Feature Catalogue (all modules)

Diagnostic: start picks bank grade-1, submit scores + Gemini Markdown + Mem0.


### Curriculum + Upload + AI Quiz
- Curriculum: content.py + curriculum.py CRUD standards/subjects/chapters/videos/chapter_prerequisites; GET /structure nested JSON in 4 queries. UI standards/subjects/chapters/courses pages + course-card/filter.
- Upload: POST /upload multipart to temp_uploads, threadpool upload_large 6MB chunks eager_async transcode, folders margdarshak_videos/thumbnails. Returns url/duration/public_id; player uses eager URL.
- AI Quiz: quiz_agent.py gemini-flash-lite-latest run_pipeline video>strict-JSON Qs verify>save generated_quizzes+questions. Endpoints generate/list/submit-result/result/status. UI quiz-generator-modal + teacher preview.

### Hints Scribe Jira Tutor Party Extras
- Hints: tutor.py LangChain Socratic chain concept+question+style+mastery 2 sentences no answer (hint_1/2/3). Scribe flags guessing vs struggling. Tracks selectedOption/timeTaken/hintRevealed.
- Jira: POST create-remedial-task ADF doc RESTv3 BasicAuth labels remedial/ai-tutor UPDATE quiz_results jira key/url.
- Tutor: chat.py sessions CRUD + message with image; Cloudinary+PIL+Gemini-1.5-flash, Mem0 long-term + recent msgs, Socratic-vs-casual switch, regex cleanup. UI tutor-chat/generative-chat/ai-tutor-dashboard.
- Party: watch_party.py+manager POST create 8char room WS PLAY/PAUSE/SEEK/CHAT/REQUEST_SYNC/SYNC_STATE/VOICE signalling, in-memory. UI study-group modal provider simple-peer voice.
- Extras: blogs RLS public-read, feedback table, grant-access allowed_classes, monitoring log-signal, recommendations mock, admin dashboard.


## 3. Roles
| Cap | Student | Teacher | Admin |
| Diagnostic+chapter quiz own results | yes | - | view |
| Tutor own sessions | yes | yes | yes |
| Party create/join | yes | yes | yes |
| Upload + create hierarchy + gen quiz | - | yes | yes |
| Read all results (JWT role policy) + grant allowed_classes | - | yes | yes |
| Blog create/edit-own + feedback | yes | yes | yes |


## 4. Workflows
W1 Onboard>Diagnostic>Memory: register trigger profiles > login > GET start grade-1 stripped > runner > POST submit Gemini+Mem0 > dashboard.
W2 Publish>Quiz: upload>Cloudinary URL>INSERT videos>POST generate strict-JSON>quizzes+questions.
W3 Attempt>Scribe>Jira>Recall: submit-result score+scribe>INSERT>if weak create Jira>link result>next chat recalls.
W4 Party: create>share id>WS>REQUEST_SYNC host SYNC_STATE>PLAY/PAUSE/SEEK>CHAT>VOICE simple-peer.
W5 Image chat: session>POST message+image>Cloudinary>PIL+Gemini>cleanup>save.


## 5. HLD
Browser SSR+CSR --REST/WS/Supabase-JS--> Vercel + Render FastAPI 12 routers CORS OAuth2>Supabase get_user <--> Supabase PG/Auth/RLS + Cloudinary + Gemini + Mem0/Qdrant + Jira. Backend-for-AI + Supabase-direct-CRUD; eager-async video; dual memory; UNIQUE user-quiz; threadpool+BackgroundTasks; ephemeral WS rooms.


## 6. LLD
main.py factory+CORS+routers; models.py Pydantic; auth.py register/login/grant get_current_user; content+curriculum CRUD+structure maps; quiz.py file-bank+analysis+solutions+sync-memories; quiz_agent pipeline+scribe+status; chat multimodal; jira ADF+link; upload temp>threadpool; party rooms+broadcast exclude_ws; blog/feedback/notify/monitor RLS-token passthrough; tutor chain; mastery new=old*0.9+perf*0.1.


## 7. Frontend (Next.js15 React18 TS)
Routes layout/page/login/dashboard/standards/subjects/chapters/courses/quiz test-results-solutions-teacher/study-group/blog/feedback/recommendations/profile/admin/faq/support/terms/api-auth. SSR landing/curriculum, CSR runner/party/chat. Browser Supabase client + axiosInstance Bearer interceptor + api.ts facades + auth/websocket providers + hook-form/zod + sonner + Recharts + jspdf + simple-peer. Tailwind+shadcn/Radix+cva+lucide+framer+themes. WS sync host authority. middleware.ts SSR guard skips _next/api/static, getUser only protected.


## 8. Backend (FastAPI)
FastAPI0.110+Uvicorn+Pydanticv2+multipart+dotenv, /docs. APIRouter per domain, typed bodies, Depends oauth2>get_current_user, HTTPException. CORS allowlist. supabase-py per-request postgrest.auth(token), admin only grant-access. genai flash-lite/1.5-flash, langchain chain, mem0ai, qdrant, Pillow, requests for Jira. Logs + seed/verify/fix scripts.


## 9. AI Subsystem
Video>Quiz flash-lite multimodal strict-JSON repair verify; Hint langchain Socratic; Diagnostic+chapter scribe score+breakdown+timings Markdown no-LaTeX; Tutor 1.5-flash PIL dual-context router cleanup; Memory Mem0+Qdrant add on submit search on chat. Mastery stub decay 0.9/0.1 + prereq stub.


## 10. Database (Supabase PG+RLS)
auth.users>profiles(role); standards>subjects>chapters>videos(url,duration,tags)+chapter_prerequisites self-join; generated_quizzes>generated_questions(options jsonb)>quiz_results UNIQUE pair score analysis responses jira; ai_chat_sessions>messages(role/content/image); blogs; feedback; engagement_logs. Owner auth.uid policies, public-read content/blogs, teacher-read results via JWT role, msgs EXISTS own session, handle_new_user trigger. SQL files database/quiz_definitions/quiz_results/chat_v2/blogs/feedback/fix.


## 11. Realtime+Media
Manager rooms/ws_to_user/metadata broadcast exclude_ws try-except. PLAY/PAUSE/SEEK currentTime, REQUEST_SYNC>SYNC_STATE, CHAT echo, VOICE to-filter simple-peer ICE. Cloudinary upload_large chunked eager_async CDN.

## 12. Security
Supabase JWT backend get_user per-request axios attaches RLS rechecks. middleware guards except public skips assets. grant needs teacher+SERVICE_ROLE. .env gitignored + example.


## 13. API Reference (auth: -=public *=harden JWT)
- POST auth/register login GET me(JWT) grant-access(teacher)
- GET POST content/standards subjects chapters videos prerequisites; GET curriculum/structure
- POST upload(*) multipart file
- GET quiz/start submit solutions JWT
- POST quiz-agent/generate submit-result GET result status list JWT
- chat sessions CRUD + message JWT
- POST jira/create-remedial-task test-connection
- POST watch-party/create GET room WS ws/room/user
- GET POST blog-agent; POST feedback JWT; POST monitoring/log-signal


## 14. Structure
Backend/app/main.py models.py api/12-files agents/tutor+mastery utils/cloudinary+party+connection+media quiz_generator json banks sql migrations requirements.txt; check/app routes components/ui lib supabase-axios-api-auth hooks middleware package.json.

## 15. Setup
Backend: venv pip install -r requirements copy env.example env fill keys run SQL files uvicorn app.main:app --reload 8000 docs. Frontend: npm install env.local API_URL+Supabase npm run dev 3000. Verify seed_db verify_table_status.

## 16. Deploy
Vercel root check build env API_URL+Supabase. Render root Backend pip install uvicorn host PORT all env add Vercel CORS. Supabase migrations+RLS. Cloudinary/Gemini/Mem0-Qdrant/Jira keys.

## 17. Roadmap
Persist rooms Realtime; JWT everywhere + rate-limit; adaptive diagnostic; user_mastery persist + prereq resolver; engagement heatmap; recommendations; certs; PWA. Fix preview CORS wildcard; api.ts auth mock uses Supabase direct. Built Next FastAPI Supabase Cloudinary Gemini Mem0 Jira.


## Appendix A - Frontend Concepts Detail
- App Router nested layouts, loading.tsx suspense, dynamic id routes useParams, searchParams for video_url.
- Data: server fetch Supabase SSR for SEO lists; client axiosInstance for AI (auto Bearer) + supabase-js for CRUD; optimistic chat + quiz timer useEffect cleanup.
- shadcn copy-paste ui primitives, Tailwind tokens, dark via next-themes class, responsive via use-mobile hook.
- Protected-route HOC checks session, redirects login; navbar role links; toast on errors; charts aggregate score/time per subject.
- WebSocket provider singleton reconnect backoff; video ref sync throttle seek events; peer connections map userId>SimplePeer.


## Appendix B - HLD/LLD Concept Map
- HLD patterns: 3-tier + BFF (FastAPI aggregates AI), CDN offload, SaaS composition, stateless API except WS rooms.
- LLD patterns: Router-Service-Util split, Pydantic DTO validation, Dependency Injection Depends, Repository via supabase-py, Manager (party rooms) observer broadcast, Chain (LangChain) for hints, ADF builder for Jira, BackgroundTasks observer for logs.
- Scaling: move rooms to Redis pubsub, Cloudinary already CDN, Supabase connection pooling, Gemini queue + cache transcripts.

> Note: condensed to fit editor limits; expands prior README which lacked HLD/LLD/frontend/backend depth.
