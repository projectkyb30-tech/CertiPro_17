# CeriExpert - Documentație Completă Premium
## Platformă de Pregătire pentru Certificări Certiport

---

## 📋 CUPRINS

1. [Overview & Vision](#1-overview--vision)
2. [Design System](#2-design-system)
3. [Technical Architecture](#3-technical-architecture)
4. [User Flows](#4-user-flows)
5. [Feature Specifications](#5-feature-specifications)
6. [Learning Paths Structure](#6-learning-paths-structure)
7. [Development Roadmap](#7-development-roadmap)
8. [Quality Assurance](#8-quality-assurance)

---

## 1. OVERVIEW & VISION

### 1.1 Misiunea Aplicației
CeriExpert este o platformă educațională premium dedicată elevilor din Moldova care doresc să obțină certificări Certiport pentru scutire de BAC sau admitere la universitate.

### 1.2 Public Țintă
- Elevi din Republica Moldova (liceu)
- Studenți care doresc certificări IT
- Persoane care urmăresc reconversie profesională în IT

### 1.3 Propunere de Valoare
- **Pregătire Completă**: Curriculum aliniat 100% cu obiectivele Certiport
- **Învățare Interactivă**: Lecții teoretice + practică hands-on + teste simulate
- **Suport AI 24/7**: Asistent virtual pentru clarificări instant
- **Preț Accesibil**: Alternative mai ieftine decât cursurile tradiționale
- **Progres Tracking**: Monitorizare detaliată a progresului

### 1.4 Cursuri Disponibile
1. **Python Programming** (IT Specialist - Python) - €100
2. **Databases (SQL)** (IT Specialist - Databases) - €100
3. **Networking Fundamentals** (IT Specialist - Networking) - €100
4. **Bundle All Courses** - €270 (economie 10%)

---

## 2. DESIGN SYSTEM

### 2.1 Identitate Vizuală

#### Paletă de Culori

**Theme Light (Default)**
```
Primary:
- Primary Blue: #0066FF
- Primary Dark: #0052CC
- Primary Light: #3385FF

Neutrals:
- Background: #FFFFFF
- Surface: #F8F9FA
- Border: #E1E4E8
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Text Tertiary: #9CA3AF

Semantic Colors:
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6

Code Theme:
- Code Background: #1E1E1E
- Syntax Green: #4EC9B0
- Syntax Blue: #569CD6
- Syntax Yellow: #DCDCAA
- Syntax Purple: #C586C0
```

**Theme Dark**
```
Primary:
- Primary Blue: #3385FF
- Primary Dark: #5B9EFF
- Primary Light: #0052CC

Neutrals:
- Background: #0D1117
- Surface: #161B22
- Border: #30363D
- Text Primary: #E6EDF3
- Text Secondary: #8B949E
- Text Tertiary: #6E7681

Semantic Colors:
- Success: #3FB950
- Warning: #D29922
- Error: #F85149
- Info: #58A6FF

Code Theme:
- Code Background: #0D1117
- Syntax Green: #7EE787
- Syntax Blue: #79C0FF
- Syntax Yellow: #FFA657
- Syntax Purple: #D2A8FF
```

### 2.2 Tipografie

```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace

Hierarchy:
H1: 32px / 700 / -0.02em
H2: 24px / 700 / -0.01em
H3: 20px / 600 / -0.01em
H4: 16px / 600 / 0em
Body Large: 16px / 400 / 0em
Body: 14px / 400 / 0em
Caption: 12px / 400 / 0.01em
Code: 14px / 400 / 0em (Monospace)
```

### 2.3 Spacing System

```
Spacing Scale (8px base):
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### 2.4 Border Radius

```
Soft Modern Rounded:
sm: 8px (buttons, inputs, chips)
md: 12px (cards, containers)
lg: 16px (modals, major sections)
xl: 24px (hero sections)
full: 9999px (pills, avatars)
```

### 2.5 Iconografie

**Icon Library**: Lucide Icons / Heroicons (professional, consistent)
**Icon Sizes**: 16px, 20px, 24px, 32px

**Core Icons Set**:
- Home: home
- Lessons: book-open
- Progress: trending-up
- Settings: settings
- Chat AI: message-circle
- Course: graduation-cap
- Module: folder
- Lesson: file-text
- Test: clipboard-check
- Practice: code
- Certificate: award
- Lock: lock
- Check: check-circle
- Alert: alert-circle

### 2.6 Backgrounds Animate

**Code Rain Effect** (pentru hero sections și fundal pagini de curs)
```css
/* Animated code snippets falling/scrolling in background */
- Opacity: 0.05 (subtle, nu distrage)
- Colors: Blue tones from palette
- Speed: Slow, elegant
- Languages: Python, SQL, Network commands relevante
```

**Particle Connect** (pentru dashboard)
```css
/* Interactive connected dots forming network pattern */
- Minimal, abstract
- Primary Blue color
- Responsive to mouse movement (optional)
```

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Technology Stack

#### Frontend
```
Framework: React 18+ with TypeScript
State Management: Zustand / Redux Toolkit
Routing: React Router v6
UI Library: Tailwind CSS + Headless UI
Animation: Framer Motion
Code Editor: Monaco Editor (VS Code engine)
Voice: ElevenLabs API integration
Charts: Recharts
Forms: React Hook Form + Zod validation
```

#### Backend
```
Runtime: Node.js 20+
Framework: Express.js / Nest.js
Database: PostgreSQL 16
ORM: Prisma
Authentication: JWT + Refresh Tokens
OTP: Twilio SMS API
AI Chat: Anthropic Claude API / OpenAI GPT-4
Real-time: Socket.io (pentru live chat)
Storage: AWS S3 (pentru assets)
CDN: CloudFlare
```

#### DevOps & Infrastructure
```
Hosting: Vercel (Frontend) + Railway/Render (Backend)
Database: Supabase / Railway PostgreSQL
Monitoring: Sentry
Analytics: PostHog / Mixpanel
Email: Resend / SendGrid
Payment: Stripe
```

### 3.2 Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  preferred_language VARCHAR(5) DEFAULT 'ro', -- ro, en, ru
  theme VARCHAR(10) DEFAULT 'light', -- light, dark
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL, -- python, databases, networking
  title_ro VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  description_ro TEXT,
  description_en TEXT,
  description_ru TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_hours INTEGER, -- estimated completion time
  total_lessons INTEGER,
  exam_objectives JSONB, -- structured exam objectives
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Table (sections like "1. Database Design")
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  code VARCHAR(20), -- e.g., "1.1", "1.2"
  title_ro VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  description_ro TEXT,
  description_en TEXT,
  description_ru TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons Table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  code VARCHAR(20), -- e.g., "1.1", "1.2"
  title_ro VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  objectives JSONB, -- learning objectives as bullet points
  theory_content_ro TEXT, -- Markdown/HTML content
  theory_content_en TEXT,
  theory_content_ru TEXT,
  theory_audio_url_ro VARCHAR(500), -- ElevenLabs generated audio
  theory_audio_url_en VARCHAR(500),
  theory_audio_url_ru VARCHAR(500),
  practice_exercises JSONB, -- array of practice problems
  estimated_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes Table (mini tests pentru fiecare lecție)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'comprehension', 'practice'
  title_ro VARCHAR(255),
  title_en VARCHAR(255),
  title_ru VARCHAR(255),
  passing_score INTEGER DEFAULT 70, -- percentage
  questions JSONB NOT NULL, -- array of questions with answers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Purchases Table
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- stripe_card, stripe_paypal, etc.
  stripe_payment_id VARCHAR(255),
  UNIQUE(user_id, course_id)
);

-- User Progress Table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- percentage
  answers JSONB, -- user's answers for review
  passed BOOLEAN,
  attempt_number INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Simulations Table
CREATE TABLE exam_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title_ro VARCHAR(255),
  title_en VARCHAR(255),
  title_ru VARCHAR(255),
  questions JSONB NOT NULL, -- comprehensive exam questions
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Attempts Table
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exam_simulation_id UUID REFERENCES exam_simulations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  breakdown JSONB, -- performance by section
  passed BOOLEAN,
  attempt_number INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat History Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id), -- nullable, pentru context
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Verifications Table
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
```

### 3.3 API Structure

```
/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   ├── POST /verify-otp
│   ├── POST /resend-otp
│   ├── POST /forgot-password
│   └── POST /reset-password
│
├── /users
│   ├── GET /me
│   ├── PATCH /me
│   ├── PATCH /me/password
│   └── PATCH /me/preferences
│
├── /courses
│   ├── GET /
│   ├── GET /:courseId
│   └── GET /:courseId/modules
│
├── /lessons
│   ├── GET /:lessonId
│   ├── GET /:lessonId/quiz
│   └── POST /:lessonId/complete
│
├── /progress
│   ├── GET /dashboard
│   ├── GET /course/:courseId
│   └── GET /statistics
│
├── /quizzes
│   ├── GET /:quizId
│   ├── POST /:quizId/submit
│   └── GET /:quizId/attempts
│
├── /exams
│   ├── GET /course/:courseId
│   ├── POST /:examId/start
│   ├── POST /:examId/submit
│   └── GET /:examId/attempts
│
├── /purchases
│   ├── GET /my-courses
│   ├── POST /checkout
│   └── POST /verify-payment
│
└── /ai-chat
    ├── POST /message
    ├── GET /history
    └── DELETE /history
```

---

## 4. USER FLOWS

### 4.1 Onboarding Flow

```
1. App Launch
   ↓
2. Welcome Animation (2s)
   - Animated logo reveal
   - Code particles background
   ↓
3. Tutorial Slides (swipeable, skippable)
   - Slide 1: "Pregătește-te pentru Certiport"
     Visual: Hero illustration
   - Slide 2: "Învață Python, SQL, Networking"
     Visual: Course icons showcase
   - Slide 3: "Obține certificate recunoscute"
     Visual: Certificate + university acceptance
   - Slide 4: "Trece examenul cu încredere"
     Visual: Success metrics
   [Skip button persistent top-right]
   ↓
4. Auth Screen
   - Login Tab | Register Tab
   ↓
5. Phone Verification (OTP)
   ↓
6. Home Dashboard (first-time user state)
```

### 4.2 Authentication Flow

```
REGISTER:
Email/Password form
  ↓
Google OAuth (alternative)
  ↓
Phone Number Entry
  ↓
OTP Verification (6 digits)
  ↓
Profile Setup (optional: name, photo)
  ↓
Home Dashboard

LOGIN:
Email/Password
  ↓
Google OAuth (alternative)
  ↓
[If phone not verified] → Phone Verification
  ↓
Home Dashboard

FORGOT PASSWORD:
Email entry
  ↓
Reset link sent
  ↓
New password form
  ↓
Login
```

### 4.3 Course Purchase Flow

```
Home Dashboard
  ↓
Browse Courses (3 cards)
  ↓
Click "Buy Course" or "Buy All Courses"
  ↓
Checkout Screen
  - Course summary
  - Price breakdown
  - Payment method selection (Stripe)
  ↓
Payment Processing
  ↓
Success Screen
  - Confetti animation
  - "Ai acces la curs!" message
  - CTA: "Începe Cursul"
  ↓
Redirect to Lessons page (course unlocked)
```

### 4.4 Learning Flow (Core Experience)

```
Lessons Page
  ↓
Select Module
  ↓
Select Lesson (locked if previous incomplete)
  ↓
Lesson Detail Page
  ├─ [Container 1] Theory Presentation
  │   - Audio narration toggle
  │   - Read theory content
  │   - AI Chat widget (sidebar, sempre disponibil)
  │   - Practical examples
  │   - Code demonstrations (Monaco editor)
  ├─ Mark "Theory Complete"
  │   ↓
  ├─ [Container 2] Comprehension Quiz
  │   - Multiple choice questions
  │   - Must pass (70%) to proceed
  │   - Instant feedback
  │   - Retry unlimited
  ├─ Mark "Quiz Passed"
  │   ↓
  ├─ [Container 3] Practice Exercises
  │   - Coding challenges (for Python)
  │   - SQL query exercises (with integrated compiler)
  │   - Network simulation tasks
  │   - Recommended exercises
  ├─ Mark "Exercises Reviewed"
  │   ↓
  └─ [Button] "Next Lesson" unlocked
      ↓
Continue to next lesson
      ↓
      [Loop until module complete]
      ↓
Module Complete
      ↓
      [Repeat for all modules]
      ↓
All Modules Complete → Unlock Exam Simulation
```

### 4.5 Exam Simulation Flow

```
Course Completed (100%)
  ↓
"Exam Simulation Available" banner
  ↓
Start Exam Simulation
  - Timer starts
  - Full exam questions
  - No AI chat during exam
  ↓
Submit Exam
  ↓
Results Screen
  - Overall Score (%)
  - Pass/Fail status
  - Breakdown by section
  - Weak areas highlighted
  ↓
Options:
  ├─ "Review Weak Areas" → redirects to specific lessons
  ├─ "Retake Exam" → restart simulation
  └─ "I'm Ready for Real Exam" 
      ↓
      Exam Preparation Checklist Modal
      - How to register for real exam
      - What to bring
      - Tips for success
      ↓
      Lock course (optional: "Exam taken" status)
```

### 4.6 AI Chat Interaction Flow

```
User clicks Chat Widget (floating button)
  ↓
Chat Panel slides in (sidebar)
  ↓
User types question
  ↓
System sends:
  - User question
  - Current lesson context
  - User's progress data
  ↓
AI Response (Claude API)
  - Contextual answer
  - Code examples if relevant
  - Links to related lessons
  ↓
Conversation history saved
  ↓
User can continue conversation or close chat
```

---

## 5. FEATURE SPECIFICATIONS

### 5.1 Home Dashboard

#### Layout
```
┌─────────────────────────────────────┐
│ Header                              │
│ [Logo] CeriExpert     [Avatar Menu] │
├─────────────────────────────────────┤
│ Welcome Section                     │
│ "Bună, [Name]!"                     │
│ "Progresul tău"                     │
├─────────────────────────────────────┤
│ Overall Progress Card               │
│ ┌───────────────────────────────┐   │
│ │ Circular Progress (%)         │   │
│ │ Courses: 1/3 completed        │   │
│ │ Lessons: 45/120 completed     │   │
│ │ Avg Score: 87%                │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ Available Courses                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Python  │ │Databases│ │Networki-││
│ │ [Icon]  │ │ [Icon]  │ │ng[Icon] ││
│ │ €100    │ │ €100    │ │ €100    ││
│ │[Buy]    │ │[Locked] │ │[Locked] ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ [Buy All Courses - €270]           │
├─────────────────────────────────────┤
│ Bottom Navigation                   │
│ [Home][Lessons][Progress][Settings] │
└─────────────────────────────────────┘
 [Chat Widget - floating bottom right]
```

#### States
- **No courses purchased**: Show all 3 course cards with "Buy" buttons
- **Some courses purchased**: Show purchased with "Continue", locked with "Buy"
- **All courses purchased**: Show all as "Continue", remove "Buy All" CTA

### 5.2 Lessons Page

#### Layout (Course Purchased)
```
┌─────────────────────────────────────┐
│ [Course Name] - Lessons             │
├─────────────────────────────────────┤
│ Progress Bar: 45% Complete          │
├─────────────────────────────────────┤
│ Module 1: [Module Name]             │
│   ├─ Lesson 1.1 [✓ Completed]      │
│   ├─ Lesson 1.2 [▶ In Progress]    │
│   └─ Lesson 1.3 [🔒 Locked]        │
│                                     │
│ Module 2: [Module Name]             │
│   ├─ Lesson 2.1 [🔒 Locked]        │
│   └─ ...                            │
├─────────────────────────────────────┤
│ Bottom Navigation                   │
└─────────────────────────────────────┘
```

#### States
- **No courses purchased**: Skeleton loading with blur + "Purchase to unlock"
- **First access**: Tutorial tooltip: "Start with your first lesson!"

### 5.3 Lesson Detail Page

#### Layout
```
┌─────────────────────────────────────┐
│ ← Back | Lesson 1.1: [Title]        │
├─────────────────────────────────────┤
│ Learning Objectives                 │
│ • Objective 1                       │
│ • Objective 2                       │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📖 Theory Presentation          │ │
│ │ [Start Reading] or [▶ Listen]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Comprehension Quiz           │ │
│ │ [Locked until theory complete]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💻 Practice Exercises           │ │
│ │ [Locked until quiz passed]      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Next Lesson] (unlocked when done)  │
└─────────────────────────────────────┘
```

#### Theory Presentation View
```
┌─────────────────────────────────────┐
│ Lesson 1.1: [Full Title]            │
│ [🔊 Listen] [🌙 Dark Mode]          │
├─────────────────────────────────────┤
│ [Markdown/HTML Content]             │
│                                     │
│ # Section Title                     │
│ Explanation text...                 │
│                                     │
│ ```python                           │
│ # Code example                      │
│ def example():                      │
│     return "Hello"                  │
│ ```                                 │
│                                     │
│ [Interactive Code Demo]             │
│ ┌─────────────────────────────────┐ │
│ │ Monaco Editor                   │ │
│ │ (Try it yourself)               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ More content...                     │
├─────────────────────────────────────┤
│ [Mark as Complete] [Ask AI →]       │
└─────────────────────────────────────┘

[AI Chat Sidebar - slides from right]
┌────────────────────┐
│ AI Assistant       │
├────────────────────┤
│ User: How does... │
│ AI: Here's how... │
├────────────────────┤
│ [Type message...]  │
└────────────────────┘
```

#### Quiz View
```
┌─────────────────────────────────────┐
│ Comprehension Quiz                  │
│ Question 1 of 10                    │
├─────────────────────────────────────┤
│ What is a primary key?              │
│                                     │
│ ○ A. A unique identifier            │
│ ○ B. A foreign key reference        │
│ ○ C. An index                       │
│ ○ D. A constraint                   │
├─────────────────────────────────────┤
│ [Previous] [Next] [Submit Quiz]     │
└─────────────────────────────────────┘

After Submit:
┌─────────────────────────────────────┐
│ Quiz Results                        │
│ Score: 8/10 (80%) ✓ PASSED          │
├─────────────────────────────────────┤
│ ✓ Question 1: Correct               │
│ ✗ Question 2: Incorrect             │
│   Correct answer: A                 │
├─────────────────────────────────────┤
│ [Review Answers] [Continue →]       │
└─────────────────────────────────────┘
```

#### Practice Exercises View
```
┌─────────────────────────────────────┐
│ Practice Exercises                  │
├─────────────────────────────────────┤
│ Exercise 1: Write a function that...│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ # Your code here                │ │
│ │ def solution():                 │ │
│ │     pass                        │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ [Run Code] [Reset] [See Solution]   │
│                                     │
│ Output:                             │
│ ┌─────────────────────────────────┐ │
│ │ (Console output)                │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ More exercises...                   │
│ [Mark Exercises Reviewed]           │
└─────────────────────────────────────┘
```

### 5.4 Progress Page

#### Layout
```
┌─────────────────────────────────────┐
│ Your Progress                       │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Overall Statistics              │ │
│ │ ├─ Total Study Time: 24h        │ │
│ │ ├─ Lessons Completed: 45/120    │ │
│ │ ├─ Average Quiz Score: 87%      │ │
│ │ └─ Current Streak: 7 days 🔥    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Course Progress                     │
│                                     │
│ Python Programming                  │
│ [████████░░] 80%                    │
│ 24/30 lessons completed             │
│                                     │
│ Databases (SQL)                     │
│ [████░░░░░░] 40%                    │
│ 12/30 lessons completed             │
│                                     │
│ Networking                          │
│ [░░░░░░░░░░] 0%                     │
│ Not started                         │
├─────────────────────────────────────┤
│ Performance by Topic                │
│ ┌─────────────────────────────────┐ │
│ │ [Bar Chart]                     │ │
│ │ Data Types: 95%                 │ │
│ │ Loops: 85%                      │ │
│ │ Functions: 78%                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Recent Activity                     │
│ • Today: Completed Lesson 2.3       │
│ • Yesterday: Passed Quiz (90%)      │
│ • 2 days ago: ...                   │
└─────────────────────────────────────┘
```

### 5.5 Settings Page

#### Layout
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ Account Information                 │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar]                        │ │
│ │ Full Name: [Input]              │ │
│ │ Email: [Input] ✓ Verified       │ │
│ │ Phone: [+373...] ✓ Verified     │ │
│ │ [Change Password]               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Preferences                         │
│ ┌─────────────────────────────────┐ │
│ │ Language: [Română ▼]            │ │
│ │   Options: Română, English, Русский │
│ │                                 │ │
│ │ Theme: [Light ▼]                │ │
│ │   Options: Light, Dark, Auto    │ │
│ │                                 │ │
│ │ Notifications: [Toggle ON]      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Learning Settings                   │
│ ┌─────────────────────────────────┐ │
│ │ Auto-play Audio: [Toggle OFF]   │ │
│ │ Code Editor Theme: [VS Dark ▼]  │ │
│ │ Font Size: [14px ▼]             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Purchased Courses                   │
│ • Python Programming (€100)         │
│   Purchased: 15 Jan 2026            │
│ • Databases (€100)                  │
│   Purchased: 20 Jan 2026            │
├─────────────────────────────────────┤
│ Support                             │
│ • Help Center                       │
│ • Contact Support                   │
│ • Terms of Service                  │
│ • Privacy Policy                    │
├─────────────────────────────────────┤
│ Account Actions                     │
│ [Logout]                            │
│ [Delete Account] (red, warning)     │
└─────────────────────────────────────┘
```

### 5.6 AI Chat Widget

#### States

**Collapsed (Default)**
```
[Chat Icon - floating button]
bottom-right corner
Blue circular button
Icon: message-circle
Badge: "AI" or notification dot if new suggested questions
```

**Expanded (Sidebar)**
```
┌────────────────────────────┐
│ AI Assistant          [×]  │
├────────────────────────────┤
│ Context: Lesson 1.1        │
│ [Clear Chat]               │
├────────────────────────────┤
│ Chat History               │
│ ┌────────────────────────┐ │
│ │ User: How does...      │ │
│ │ AI: Primary keys are...│ │
│ │                        │ │
│ │ User: Can you show...  │ │
│ │ AI: Here's example:    │ │
│ │ ```sql                 │ │
│ │ CREATE TABLE...        │ │
│ │ ```                    │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ [Type your question...]    │
│ [Send →]                   │
└────────────────────────────┘
```

#### Features
- Context-aware (knows current lesson)
- Code syntax highlighting in responses
- Quick action buttons (e.g., "Explain this concept", "Show example")
- Conversation history saved per lesson
- Clear chat option
- Typing indicator when AI is responding

### 5.7 Exam Simulation

#### Pre-Exam Screen
```
┌─────────────────────────────────────┐
│ Certiport Exam Simulation           │
│ Python Programming                  │
├─────────────────────────────────────┤
│ This simulation mimics the real     │
│ Certiport exam format.              │
│                                     │
│ Details:                            │
│ • Questions: 40                     │
│ • Time Limit: 50 minutes            │
│ • Passing Score: 70%                │
│ • No AI assistance during exam      │
│                                     │
│ You can retake this exam unlimited  │
│ times to improve your score.        │
├─────────────────────────────────────┤
│ [Start Exam]                        │
└─────────────────────────────────────┘
```

#### Exam In Progress
```
┌─────────────────────────────────────┐
│ Question 15/40     Time: 23:45 ⏱️   │
├─────────────────────────────────────┤
│ What will the following code output?│
│                                     │
│ ```python                           │
│ x = [1, 2, 3]                       │
│ print(x[1])                         │
│ ```                                 │
│                                     │
│ ○ A. 1                              │
│ ○ B. 2                              │
│ ○ C. 3                              │
│ ○ D. Error                          │
├─────────────────────────────────────┤
│ [Flag] [Previous] [Next] [Submit]   │
└─────────────────────────────────────┘
```

#### Results Screen
```
┌─────────────────────────────────────┐
│ Exam Results                        │
├─────────────────────────────────────┤
│         Score: 82%                  │
│         ✓ PASSED                    │
│                                     │
│ Congratulations! You're ready for   │
│ the real exam.                      │
├─────────────────────────────────────┤
│ Performance by Section:             │
│ ┌─────────────────────────────────┐ │
│ │ Operations & Data Types    95%  │ │
│ │ Flow Control              85%  │ │
│ │ I/O Operations            78%  │ │
│ │ Error Handling            70%  │ │ ← Weak
│ │ Modules & Tools           88%  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Recommendations:                    │
│ • Review "Error Handling" lessons   │
│ • Practice try-except blocks        │
├─────────────────────────────────────┤
│ [Review Weak Areas]                 │
│ [Retake Exam]                       │
│ [I'm Ready for Real Exam]           │
└─────────────────────────────────────┘
```

#### "I'm Ready" Modal
```
┌─────────────────────────────────────┐
│ Ready for the Real Exam? ✅          │
├─────────────────────────────────────┤
│ Before taking the official Certiport│
│ exam, make sure you:                │
│                                     │
│ ✓ Register at certiport.com         │
│ ✓ Find a testing center in Moldova  │
│ ✓ Bring valid ID                    │
│ ✓ Arrive 15 minutes early           │
│ ✓ Review exam policies              │
│                                     │
│ Tips for Success:                   │
│ • Read questions carefully          │
│ • Manage your time (50 minutes)     │
│ • Flag difficult questions          │
│ • Stay calm and focused             │
├─────────────────────────────────────┤
│ Good luck! 🎉                        │
│                                     │
│ [I Understand] [Back to Dashboard]  │
└─────────────────────────────────────┘
```

---

## 6. LEARNING PATHS STRUCTURE

### 6.1 Python Programming Course

**Course Overview**
- **Total Lessons**: 30
- **Estimated Duration**: 40 hours
- **Prerequisites**: None (beginner-friendly)
- **Certification**: IT Specialist - Python

**Module Structure** (based on Certiport objectives)

```
MODULE 1: Operations using Data Types and Operators (8 lessons)
├─ Lesson 1.1: Introduction to Python & Data Types
│  Objectives: str, int, float, bool
│  Theory: Variable assignment, type checking, type() function
│  Practice: Type conversion exercises
│  Quiz: 10 questions on data types
│
├─ Lesson 1.2: String Operations & Indexing
│  Objectives: String indexing, slicing, immutability
│  Theory: Zero-based indexing, negative indexing, slice notation
│  Practice: String manipulation challenges
│  Quiz: 8 questions on strings
│
├─ Lesson 1.3: Lists - Creation & Basic Operations
│  Objectives: List creation, indexing, slicing
│  Theory: Mutable sequences, list syntax
│  Practice: List manipulation exercises
│  Quiz: 10 questions
│
├─ Lesson 1.4: Advanced List Operations
│  Objectives: append, insert, remove, sort, reverse
│  Theory: List methods, in-place vs returning new list
│  Practice: Sorting algorithms, list comprehensions
│  Quiz: 12 questions
│
├─ Lesson 1.5: Operator Precedence
│  Objectives: Understanding evaluation order
│  Theory: PEMDAS in Python, parentheses usage
│  Practice: Complex expression evaluation
│  Quiz: 10 questions
│
├─ Lesson 1.6: Assignment Operators
│  Objectives: =, +=, -=, *=, /=, //=, %=, **=
│  Theory: Compound assignment, augmented assignment
│  Practice: Operator usage exercises
│  Quiz: 8 questions
│
├─ Lesson 1.7: Comparison & Logical Operators
│  Objectives: ==, !=, <, >, <=, >=, and, or, not
│  Theory: Boolean logic, truth tables
│  Practice: Conditional expression building
│  Quiz: 10 questions
│
└─ Lesson 1.8: Identity & Containment Operators
   Objectives: is, is not, in, not in
   Theory: Object identity vs equality, membership testing
   Practice: Real-world use cases
   Quiz: 8 questions

MODULE 2: Flow Control with Decisions and Loops (7 lessons)
├─ Lesson 2.1: if Statements & Conditional Logic
│  Objectives: if, elif, else syntax
│  Theory: Indentation, boolean expressions
│  Practice: Simple decision-making programs
│  Quiz: 10 questions
│
├─ Lesson 2.2: Nested & Compound Conditionals
│  Objectives: Nested if, compound conditions with and/or
│  Theory: Complex decision trees, DeMorgan's laws
│  Practice: Multi-level decision programs
│  Quiz: 12 questions
│
├─ Lesson 2.3: while Loops
│  Objectives: while syntax, loop control
│  Theory: Loop conditions, infinite loops, sentinel values
│  Practice: Input validation, counting loops
│  Quiz: 10 questions
│
├─ Lesson 2.4: for Loops & range()
│  Objectives: for syntax, range() function
│  Theory: Iteration over sequences, range parameters
│  Practice: Iteration patterns
│  Quiz: 10 questions
│
├─ Lesson 2.5: Loop Control - break, continue, pass
│  Objectives: Early exit, skipping iterations
│  Theory: break vs continue vs pass, when to use each
│  Practice: Search algorithms, filtering
│  Quiz: 10 questions
│
├─ Lesson 2.6: Nested Loops
│  Objectives: Loops within loops
│  Theory: Inner/outer loop mechanics, performance
│  Practice: Matrix operations, patterns
│  Quiz: 12 questions
│
└─ Lesson 2.7: Loops with Compound Conditions
   Objectives: Complex loop termination
   Theory: Multiple exit conditions, flag variables
   Practice: Advanced iteration problems
   Quiz: 10 questions

MODULE 3: Input and Output Operations (5 lessons)
├─ Lesson 3.1: Console Input with input()
│  Objectives: Reading user input, type conversion
│  Theory: input() function, string to int/float
│  Practice: Interactive programs
│  Quiz: 8 questions
│
├─ Lesson 3.2: Formatted Output with print()
│  Objectives: print() function, formatting
│  Theory: sep, end parameters, escape sequences
│  Practice: Formatting exercises
│  Quiz: 8 questions
│
├─ Lesson 3.3: String Formatting Methods
│  Objectives: .format() method, f-strings
│  Theory: Placeholder syntax, alignment, precision
│  Practice: Report generation, tables
│  Quiz: 10 questions
│
├─ Lesson 3.4: File I/O - Reading Files
│  Objectives: open(), read(), readlines(), close()
│  Theory: File modes, file objects, context managers
│  Practice: Reading text files, CSV processing
│  Quiz: 10 questions
│
└─ Lesson 3.5: File I/O - Writing & Appending
   Objectives: write(), append mode, with statement
   Theory: File persistence, best practices
   Practice: Log files, data export
   Quiz: 10 questions

MODULE 4: Code Documentation and Structure (4 lessons)
├─ Lesson 4.1: Code Style & Indentation
│  Objectives: PEP 8, whitespace, readability
│  Theory: Indentation rules, line length, naming
│  Practice: Code cleanup exercises
│  Quiz: 8 questions
│
├─ Lesson 4.2: Comments & Docstrings
│  Objectives: # comments, """docstrings"""
│  Theory: When to comment, documentation strings
│  Practice: Documenting existing code
│  Quiz: 8 questions
│
├─ Lesson 4.3: Function Definitions
│  Objectives: def keyword, parameters, return
│  Theory: Function syntax, scope, call signatures
│  Practice: Creating utility functions
│  Quiz: 12 questions
│
└─ Lesson 4.4: Advanced Functions
   Objectives: Default parameters, multiple returns
   Theory: *args, **kwargs, lambda functions
   Practice: Function composition
   Quiz: 12 questions

MODULE 5: Troubleshooting and Error Handling (3 lessons)
├─ Lesson 5.1: Types of Errors
│  Objectives: Syntax, runtime, logic errors
│  Theory: Error categories, debugging mindset
│  Practice: Error identification exercises
│  Quiz: 10 questions
│
├─ Lesson 5.2: Exception Handling
│  Objectives: try, except, else, finally
│  Theory: Exception types, catching specific errors
│  Practice: Robust input validation
│  Quiz: 12 questions
│
└─ Lesson 5.3: Unit Testing
   Objectives: unittest module, assert methods
   Theory: Test-driven development, test cases
   Practice: Writing tests for functions
   Quiz: 10 questions

MODULE 6: Operations using Modules and Tools (3 lessons)
├─ Lesson 6.1: Built-in Modules - os & sys
│  Objectives: File system operations, command-line args
│  Theory: Importing modules, module functions
│  Practice: Directory traversal, CLI scripts
│  Quiz: 10 questions
│
├─ Lesson 6.2: Math & Random Modules
│  Objectives: math functions, random number generation
│  Theory: Mathematical operations, randomness
│  Practice: Calculations, simulations
│  Quiz: 10 questions
│
└─ Lesson 6.3: Datetime Module
   Objectives: Date/time manipulation, formatting
   Theory: datetime objects, strftime, timedeltas
   Practice: Date calculations, scheduling
   Quiz: 10 questions

FINAL: Certiport Exam Simulation
• 40 questions covering all modules
• 50-minute time limit
• Passing score: 70%
• Unlimited retakes
```

### 6.2 Databases (SQL) Course

**Course Overview**
- **Total Lessons**: 32
- **Estimated Duration**: 45 hours
- **Prerequisites**: None
- **Certification**: IT Specialist - Databases

**Module Structure**

```
MODULE 1: Database Design (8 lessons)
├─ Lesson 1.1: Database Fundamentals
│  Objectives: Tables, rows, columns, entities
│  Theory: Relational database concepts, RDBMS intro
│  Practice: Identifying entities in scenarios
│  Quiz: 10 questions
│
├─ Lesson 1.2: Primary Keys
│  Objectives: Primary key definition, composite keys
│  Theory: Uniqueness, NOT NULL, auto-increment
│  Practice: Designing primary keys for tables
│  Quiz: 10 questions
│
├─ Lesson 1.3: Data Types - Text & Numbers
│  Objectives: VARCHAR, CHAR, INT, DECIMAL, FLOAT
│  Theory: Choosing appropriate data types, storage
│  Practice: Data type selection exercises
│  Quiz: 10 questions
│
├─ Lesson 1.4: Data Types - Dates & Booleans
│  Objectives: DATE, DATETIME, BOOLEAN
│  Theory: Temporal data, true/false values
│  Practice: Date/boolean field design
│  Quiz: 8 questions
│
├─ Lesson 1.5: Table Relationships
│  Objectives: Foreign keys, one-to-many, many-to-many
│  Theory: Referential integrity, JOIN foundations
│  Practice: ERD reading and creation
│  Quiz: 12 questions
│
├─ Lesson 1.6: Entity-Relationship Diagrams (ERD)
│  Objectives: Reading and creating ERDs
│  Theory: Crow's foot notation, cardinality
│  Practice: Converting requirements to ERD
│  Quiz: 10 questions
│
├─ Lesson 1.7: Database Normalization
│  Objectives: 1NF, 2NF, 3NF
│  Theory: Normalization process, avoiding redundancy
│  Practice: Normalizing sample databases
│  Quiz: 12 questions
│
└─ Lesson 1.8: Data Protection & Security
   Objectives: Backups, GRANT, REVOKE, encryption
   Theory: Principle of least privilege, auditing
   Practice: Security scenario analysis
   Quiz: 10 questions

MODULE 2: Database Object Management (DDL) (6 lessons)
├─ Lesson 2.1: CREATE TABLE Statements
│  Objectives: Creating tables with proper syntax
│  Theory: Column definitions, constraints
│  Practice: Table creation exercises
│  Quiz: 10 questions
│
├─ Lesson 2.2: ALTER & DROP TABLE
│  Objectives: Modifying and deleting tables
│  Theory: ADD COLUMN, DROP COLUMN, MODIFY
│  Practice: Schema evolution exercises
│  Quiz: 10 questions
│
├─ Lesson 2.3: Views - CREATE & ALTER
│  Objectives: Creating and modifying views
│  Theory: Purpose of views, virtual tables
│  Practice: View creation for reporting
│  Quiz: 10 questions
│
├─ Lesson 2.4: Stored Procedures
│  Objectives: Creating procedures with parameters
│  Theory: Input/output parameters, return values
│  Practice: Writing reusable procedures
│  Quiz: 10 questions
│
├─ Lesson 2.5: Functions
│  Objectives: User-defined functions
│  Theory: Scalar vs table-valued functions
│  Practice: Creating utility functions
│  Quiz: 10 questions
│
└─ Lesson 2.6: Indexes
   Objectives: Clustered vs non-clustered indexes
   Theory: When to use indexes, performance impact
   Practice: Index optimization exercises
   Quiz: 10 questions

MODULE 3: Data Retrieval (6 lessons)
├─ Lesson 3.1: SELECT Basics
│  Objectives: SELECT, FROM, WHERE, DISTINCT
│  Theory: Query structure, filtering data
│  Practice: Simple SELECT exercises
│  Quiz: 10 questions
│
├─ Lesson 3.2: JOIN Operations
│  Objectives: INNER, LEFT, RIGHT, FULL OUTER, CROSS
│  Theory: Join types, join conditions, self-joins
│  Practice: Multi-table queries
│  Quiz: 12 questions
│
├─ Lesson 3.3: Advanced SELECT Features
│  Objectives: Column aliases, computed columns, CONCAT
│  Theory: Expressions in SELECT, NULLIF
│  Practice: Complex SELECT statements
│  Quiz: 10 questions
│
├─ Lesson 3.4: Sorting & Filtering
│  Objectives: ORDER BY, WHERE, LIKE, BETWEEN
│  Theory: Pattern matching, range queries
│  Practice: Filtered and sorted queries
│  Quiz: 10 questions
│
├─ Lesson 3.5: Advanced Filtering
│  Objectives: IN, NOT IN, ANY, ALL, NULL handling
│  Theory: Subqueries in WHERE, comparison operators
│  Practice: Complex filtering scenarios
│  Quiz: 12 questions
│
└─ Lesson 3.6: Aggregate Functions
   Objectives: GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX
   Theory: Grouping data, aggregate conditions
   Practice: Reporting queries
   Quiz: 12 questions

MODULE 4: Data Manipulation (DML) (4 lessons)
├─ Lesson 4.1: INSERT Statements
│  Objectives: INSERT INTO VALUES, INSERT INTO SELECT
│  Theory: Adding data to tables, bulk inserts
│  Practice: Data insertion exercises
│  Quiz: 10 questions
│
├─ Lesson 4.2: UPDATE Statements
│  Objectives: Updating single and multiple rows
│  Theory: UPDATE syntax, WHERE clause importance
│  Practice: Safe update operations
│  Quiz: 10 questions
│
├─ Lesson 4.3: DELETE Statements
│  Objectives: Deleting data safely
│  Theory: DELETE vs TRUNCATE, cascading deletes
│  Practice: Data removal exercises
│  Quiz: 10 questions
│
└─ Lesson 4.4: Transactions
   Objectives: BEGIN, COMMIT, ROLLBACK
   Theory: ACID properties, transaction management
   Practice: Multi-statement transactions
   Quiz: 10 questions

MODULE 5: Troubleshooting (3 lessons)
├─ Lesson 5.1: DDL Error Troubleshooting
│  Objectives: Syntax and runtime errors in DDL
│  Theory: Common mistakes, error messages
│  Practice: Debugging CREATE/ALTER statements
│  Quiz: 10 questions
│
├─ Lesson 5.2: DML Error Troubleshooting
│  Objectives: INSERT/UPDATE/DELETE errors
│  Theory: Constraint violations, data type mismatches
│  Practice: Debugging data manipulation
│  Quiz: 10 questions
│
└─ Lesson 5.3: Query Troubleshooting
   Objectives: SELECT query errors, performance issues
   Theory: Join problems, NULL handling, optimization
   Practice: Query debugging exercises
   Quiz: 10 questions

MODULE 6: Practical SQL Projects (5 lessons)
├─ Lesson 6.1: Database Design Project
│  Objectives: End-to-end database creation
│  Practice: Design and implement a complete database
│
├─ Lesson 6.2: Query Optimization
│  Objectives: Writing efficient queries
│  Practice: Performance tuning exercises
│
├─ Lesson 6.3: Reporting with SQL
│  Objectives: Creating business reports
│  Practice: Complex reporting queries
│
├─ Lesson 6.4: Data Migration
│  Objectives: Moving data between systems
│  Practice: ETL exercises
│
└─ Lesson 6.5: Real-world Scenarios
   Objectives: Applying all concepts
   Practice: Comprehensive SQL challenges

FINAL: Certiport Exam Simulation
• 45 questions covering all modules
• 50-minute time limit
• Passing score: 70%
• Unlimited retakes
```

### 6.3 Networking Fundamentals Course

**Course Overview**
- **Total Lessons**: 30
- **Estimated Duration**: 42 hours
- **Prerequisites**: None
- **Certification**: IT Specialist - Networking

**Module Structure**

```
MODULE 1: Networking Fundamentals (5 lessons)
├─ Lesson 1.1: Network Concepts
│  Objectives: Internet, intranet, extranet, client-server
│  Theory: Network types, transmission types (unicast, multicast, broadcast)
│  Practice: Network scenario identification
│  Quiz: 10 questions
│
├─ Lesson 1.2: Network Devices
│  Objectives: Routers, switches, hubs, IoT devices
│  Theory: Device functions, network architecture
│  Practice: Device role identification
│  Quiz: 10 questions
│
├─ Lesson 1.3: Cloud & Virtualization
│  Objectives: Hypervisors, VMs, virtual switches
│  Theory: Virtualization benefits, cloud computing
│  Practice: Virtualization scenarios
│  Quiz: 10 questions
│
├─ Lesson 1.4: Remote Access - VPN
│  Objectives: VPN concepts, tunneling
│  Theory: VPN types, encryption, use cases
│  Practice: VPN configuration scenarios
│  Quiz: 10 questions
│
└─ Lesson 1.5: Remote Desktop & Remote Access
   Objectives: RDP, remote administration
   Theory: Remote access protocols, security
   Practice: Remote access scenarios
   Quiz: 8 questions

MODULE 2: Network Infrastructures (6 lessons)
├─ Lesson 2.1: Local Area Networks (LANs)
│  Objectives: LAN characteristics, wired vs wireless
│  Theory: LAN topologies, Ethernet
│  Practice: LAN design exercises
│  Quiz: 10 questions
│
├─ Lesson 2.2: VLANs & Network Segmentation
│  Objectives: VLAN concepts, security zones, DMZ
│  Theory: VLAN configuration, trunk ports
│  Practice: VLAN planning exercises
│  Quiz: 10 questions
│
├─ Lesson 2.3: Wide Area Networks (WANs)
│  Objectives: WAN technologies (DSL, cable, satellite, cellular)
│  Theory: WAN vs LAN, WAN connectivity options
│  Practice: WAN technology selection
│  Quiz: 10 questions
│
├─ Lesson 2.4: Wireless Networking Standards
│  Objectives: 802.11 standards, Bluetooth
│  Theory: WiFi generations, frequency bands
│  Practice: WiFi standard comparison
│  Quiz: 10 questions
│
├─ Lesson 2.5: Wireless Security
│  Objectives: WPA, WPA2, WEP, 802.1X
│  Theory: Encryption methods, authentication
│  Practice: Wireless security configuration
│  Quiz: 10 questions
│
└─ Lesson 2.6: Network Topologies
   Objectives: Star, mesh, ring, bus, logical vs physical
   Theory: Topology advantages/disadvantages
   Practice: Topology identification
   Quiz: 10 questions

MODULE 3: Network Hardware (5 lessons)
├─ Lesson 3.1: Switches - Basics
│  Objectives: Switch functions, ports, managed vs unmanaged
│  Theory: MAC table, Layer 2 switching
│  Practice: Switch selection exercises
│  Quiz: 10 questions
│
├─ Lesson 3.2: Advanced Switching
│  Objectives: VLANs, trunk ports, spanning tree
│  Theory: Loop prevention, broadcast domains
│  Practice: Advanced switch configuration
│  Quiz: 12 questions
│
├─ Lesson 3.3: Routers
│  Objectives: Routing functions, routing tables
│  Theory: Static vs dynamic routing, default routes
│  Practice: Basic routing configuration
│  Quiz: 12 questions
│
├─ Lesson 3.4: Advanced Routing
│  Objectives: Port forwarding, QoS, network segmentation
│  Theory: Routing protocols, convergence
│  Practice: Advanced routing scenarios
│  Quiz: 12 questions
│
└─ Lesson 3.5: Physical Media
   Objectives: Cable types (fiber, twisted pair, CAT5-CAT7)
   Theory: Cable characteristics, EMI, crossover vs straight-through
   Practice: Cable selection exercises
   Quiz: 10 questions

MODULE 4: Protocols and Services (8 lessons)
├─ Lesson 4.1: OSI Model
│  Objectives: 7 layers, purpose of each layer
│  Theory: Encapsulation, protocol stack
│  Practice: OSI layer identification
│  Quiz: 12 questions
│
├─ Lesson 4.2: TCP/IP Model
│  Objectives: 4 layers, comparison with OSI
│  Theory: TCP vs UDP, application protocols
│  Practice: Protocol categorization
│  Quiz: 10 questions
│
├─ Lesson 4.3: IPv4 Addressing
│  Objectives: IP address structure, subnet masks, classes
│  Theory: Public vs private addresses, subnetting
│  Practice: IPv4 addressing exercises
│  Quiz: 12 questions
│
├─ Lesson 4.4: IPv4 Subnetting
│  Objectives: Subnet calculation, CIDR notation
│  Theory: Subnetting process, subnet design
│  Practice: Subnetting calculations
│  Quiz: 12 questions
│
├─ Lesson 4.5: IPv6 Addressing
│  Objectives: IPv6 format, address types
│  Theory: Link-local vs global, abbreviation rules
│  Practice: IPv6 configuration exercises
│  Quiz: 12 questions
│
├─ Lesson 4.6: Well-Known Ports
│  Objectives: HTTP, HTTPS, FTP, SMTP, DNS, SSH, RDP
│  Theory: Port numbers, service identification
│  Practice: Port recognition exercises
│  Quiz: 10 questions
│
├─ Lesson 4.7: DNS & Name Resolution
│  Objectives: DNS records (A, AAAA, MX, CNAME, PTR)
│  Theory: Forward vs reverse lookup, DNS hierarchy
│  Practice: DNS configuration scenarios
│  Quiz: 12 questions
│
└─ Lesson 4.8: Network Services
   Objectives: DHCP, NAT, firewalls
   Theory: Dynamic vs static addressing, PAT
   Practice: Service configuration exercises
   Quiz: 12 questions

MODULE 5: Troubleshooting (6 lessons)
├─ Lesson 5.1: Troubleshooting Process
│  Objectives: Systematic troubleshooting steps
│  Theory: Problem identification, isolation, resolution
│  Practice: Troubleshooting scenarios
│  Quiz: 10 questions
│
├─ Lesson 5.2: Hardware Tools
│  Objectives: Cable testers, multimeters, TDR
│  Theory: Tool selection, usage
│  Practice: Tool identification exercises
│  Quiz: 8 questions
│
├─ Lesson 5.3: Windows Commands - ping & ipconfig
│  Objectives: Basic connectivity testing
│  Theory: Command syntax, output interpretation
│  Practice: Command usage exercises
│  Quiz: 10 questions
│
├─ Lesson 5.4: Windows Commands - Advanced
│  Objectives: tracert, pathping, nslookup, netstat, arp
│  Theory: Advanced diagnostics, route tracing
│  Practice: Command scenarios
│  Quiz: 12 questions
│
├─ Lesson 5.5: Linux Commands - Basics
│  Objectives: ping, ip addr syntax
│  Theory: Linux networking basics
│  Practice: Linux command exercises
│  Quiz: 10 questions
│
└─ Lesson 5.6: Linux Commands - Advanced
   Objectives: traceroute, dig, host, netstat, arp
   Theory: Linux diagnostic tools
   Practice: Advanced Linux troubleshooting
   Quiz: 12 questions

FINAL: Certiport Exam Simulation
• 40 questions covering all modules
• 50-minute time limit
• Passing score: 70%
• Unlimited retakes
```

---

## 7. DEVELOPMENT ROADMAP

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Core infrastructure and authentication

**Deliverables**:
- Database schema implementation
- User authentication (email, Google OAuth)
- Phone OTP verification
- Basic UI shell (navigation, layout)
- Landing page with onboarding flow
- Settings page (basic)

**Tech Stack Setup**:
- React + TypeScript + Tailwind
- Node.js + Express + PostgreSQL
- Prisma ORM
- JWT authentication
- Twilio integration

### Phase 2: Course Management (Weeks 5-8)
**Goal**: Course structure and content delivery

**Deliverables**:
- Home dashboard
- Course listing and purchase flow
- Stripe payment integration
- Lessons page with module/lesson hierarchy
- Lesson detail page (theory view)
- Audio narration integration (ElevenLabs)
- Monaco code editor integration

**Features**:
- Course locking/unlocking logic
- Progress tracking basics
- Sequential lesson access

### Phase 3: Interactive Learning (Weeks 9-12)
**Goal**: Quizzes, practice, and AI chat

**Deliverables**:
- Quiz system (creation, taking, grading)
- Practice exercises interface
- Python/SQL code compiler integration
- AI chat widget (Claude API)
- Context-aware AI responses
- Chat history storage

**Features**:
- Quiz passing requirements
- Code execution sandbox
- Real-time AI responses

### Phase 4: Progress & Analytics (Weeks 13-14)
**Goal**: User progress tracking and visualization

**Deliverables**:
- Progress page with statistics
- Performance charts
- Streak tracking
- Time tracking per lesson
- Activity feed

**Features**:
- Recharts integration
- Performance breakdowns by topic

### Phase 5: Exam Simulation (Weeks 15-16)
**Goal**: Full exam simulation experience

**Deliverables**:
- Exam question bank
- Exam taking interface with timer
- Results analysis and breakdown
- Weak area identification
- Exam retake functionality
- "Ready for real exam" flow

**Features**:
- Timed exam environment
- Performance analytics
- Recommendations engine

### Phase 6: Polish & Localization (Weeks 17-18)
**Goal**: Multi-language, themes, animations

**Deliverables**:
- Romanian, English, Russian translations
- Dark mode implementation
- Animated backgrounds (code rain, particles)
- Micro-interactions and animations
- Performance optimization
- Responsive design refinement

**Features**:
- Language switcher
- Theme switcher
- Framer Motion animations

### Phase 7: Testing & QA (Weeks 19-20)
**Goal**: Quality assurance and bug fixes

**Activities**:
- Unit testing (Jest)
- Integration testing
- E2E testing (Playwright/Cypress)
- Performance testing
- Security audit
- User acceptance testing
- Bug fixes

### Phase 8: Launch Preparation (Weeks 21-22)
**Goal**: Deployment and go-to-market

**Deliverables**:
- Production deployment (Vercel + Railway)
- Monitoring setup (Sentry)
- Analytics integration (PostHog)
- SEO optimization
- Documentation (user guides)
- Marketing materials
- Support system setup

**Activities**:
- Load testing
- Final security review
- Soft launch to beta users
- Feedback collection
- Final adjustments

### Post-Launch (Ongoing)
**Continuous Improvements**:
- Feature enhancements based on feedback
- Content updates (new lessons)
- Performance optimization
- Bug fixes
- Additional courses (future)
- Mobile app (iOS/Android) - Phase 2

---

## 8. QUALITY ASSURANCE

### 8.1 Testing Strategy

**Unit Tests**
```javascript
// Example: Quiz grading logic
describe('Quiz Grading', () => {
  it('should calculate correct percentage', () => {
    const answers = [true, true, false, true];
    const score = calculateScore(answers, correctAnswers);
    expect(score).toBe(75);
  });

  it('should mark as passed if score >= 70', () => {
    expect(isPassed(75)).toBe(true);
    expect(isPassed(69)).toBe(false);
  });
});
```

**Integration Tests**
- API endpoint testing
- Database operations
- Third-party integrations (Stripe, Twilio, ElevenLabs, Claude API)

**E2E Tests**
- Complete user journeys (registration → purchase → lesson completion)
- Critical flows (payment, exam simulation)

### 8.2 Performance Metrics

**Target Metrics**:
- Initial load: < 2s
- Time to Interactive: < 3s
- Lighthouse Score: 90+
- API response time: < 200ms (median)
- Database query time: < 50ms (median)

**Monitoring**:
- Real User Monitoring (RUM)
- Error tracking (Sentry)
- Performance analytics

### 8.3 Security Measures

**Implementation**:
- HTTPS everywhere
- JWT with secure refresh tokens
- Rate limiting on APIs
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Secure password hashing (bcrypt)
- OTP expiration and rate limiting
- Environment variable management

**Compliance**:
- GDPR compliance (for EU users)
- Data encryption at rest and in transit
- Regular security audits

### 8.4 Accessibility

**Standards**: WCAG 2.1 AA compliance

**Features**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios (4.5:1 minimum)
- Focus indicators
- Alt text for images
- Semantic HTML

### 8.5 Browser & Device Support

**Desktop Browsers**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Mobile**:
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)
- Responsive design: 320px - 2560px

### 8.6 Content Quality

**Lesson Content**:
- Reviewed by subject matter experts
- Aligned with Certiport objectives
- Clear, beginner-friendly language
- Code examples tested and verified
- Audio narration professionally produced

**Quizzes**:
- Questions validated against exam objectives
- Multiple reviewers for accuracy
- Explanations for incorrect answers

---

## APPENDIX A: UI Component Library

### Core Components

```typescript
// Button Component
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg

// Card Component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Input Component
<Input
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={onChange}
  error="Error message"
/>

// Modal Component
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>

// Badge Component
<Badge variant="success">Completed</Badge>
// Variants: success, warning, error, info, neutral

// Progress Bar
<ProgressBar value={75} max={100} />

// Tabs Component
<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content 1</TabPanel>
    <TabPanel>Content 2</TabPanel>
  </TabPanels>
</Tabs>
```

---

## APPENDIX B: API Response Examples

```json
// GET /api/v1/users/me
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+373...",
  "full_name": "John Doe",
  "preferred_language": "ro",
  "theme": "light",
  "created_at": "2026-01-15T10:00:00Z"
}

// GET /api/v1/courses
{
  "courses": [
    {
      "id": "uuid",
      "slug": "python",
      "title": "Python Programming",
      "description": "Learn Python...",
      "price": 100.00,
      "duration_hours": 40,
      "total_lessons": 30,
      "is_purchased": true
    }
  ]
}

// GET /api/v1/progress/dashboard
{
  "overall": {
    "total_courses": 3,
    "purchased_courses": 2,
    "completed_courses": 1,
    "total_lessons": 90,
    "completed_lessons": 45,
    "average_score": 87,
    "current_streak": 7,
    "total_study_time": 86400 // seconds
  },
  "courses": [
    {
      "course_id": "uuid",
      "course_name": "Python Programming",
      "progress_percentage": 80,
      "lessons_completed": 24,
      "lessons_total": 30
    }
  ]
}

// POST /api/v1/quizzes/:quizId/submit
{
  "score": 80,
  "passed": true,
  "total_questions": 10,
  "correct_answers": 8,
  "attempt_number": 1,
  "feedback": [
    {
      "question_id": 1,
      "is_correct": true
    },
    {
      "question_id": 2,
      "is_correct": false,
      "correct_answer": "A",
      "explanation": "Primary keys must be unique..."
    }
  ]
}
```

---

## APPENDIX C: Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Third-party APIs
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+..."

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

ANTHROPIC_API_KEY="sk-ant-..."
ELEVENLABS_API_KEY="..."

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Monitoring
SENTRY_DSN="..."
POSTHOG_API_KEY="..."

# Email
RESEND_API_KEY="..."
```

---

## SUMMARY

**CeriExpert** este o platformă educațională premium, construită cu tehnologii moderne, care oferă elevilor din Moldova o cale rapidă și accesibilă către certificări Certiport în Python, SQL și Networking.

**Caracteristici Cheie**:
✅ Design modern, profesional (alb-negru-albastru)
✅ Experiență de învățare interactivă cu AI
✅ Progres tracking detaliat
✅ Simulări complete de examen
✅ Suport multilingv (RO/EN/RU)
✅ Dark/Light theme
✅ Responsive (mobile-first)
✅ Securitate și performanță enterprise-grade

**Timeline**: 22 săptămâni dezvoltare
**Investment**: €100k+ production-ready app
**ROI**: Accesibil pentru studenți, scalabil pentru business

---

**END OF DOCUMENTATION**
