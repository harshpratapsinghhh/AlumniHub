# AlumniHub — Production Alumni Networking & Management Platform

**AlumniHub** is a production-grade full-stack web application built to connect university alumni and students through a centralized, modern platform. Students can discover alumni mentors, filter career opportunities, explore campus events, and send connection requests. Alumni can post job openings, publish events, share industry advice, and build meaningful relationships within their alma mater community. An integrated Admin Console provides system oversight, platform analytics, and content moderation capabilities.

---

## 🌟 Key Features

### 1. Authentication & Role Authorization
- **Role-Based Access Control**: Supports **Student**, **Alumni**, and **Admin** user types.
- **Supabase Auth Integration**: Secure registration, login, session persistence, and server-side middleware validation.
- **Automated Database Trigger**: Auto-creates a relational profile row upon auth sign-up via Postgres triggers.

### 2. User Profile System
- **Comprehensive Profile Fields**: Full name, current company/organization, degree/branch, graduation year/batch, bio, location, avatar URL, and cover banner.
- **Social Profiles**: Integration for LinkedIn, GitHub, and Portfolio URLs.
- **Skills Management**: Interactive skills addition, endorsements, and skill tag removal.

### 3. Alumni Directory & Advanced Search
- **Multi-Parametric Filter**: Filter users by Name, Role (`Student` / `Alumni`), Company, Skill, Graduation Batch, and Degree Branch.
- **Smooth UX**: Instant client debounce search with zero unnecessary API re-fetches.

### 4. Connection System
- **Request States**: Send Request → Pending → Accepted / Declined → Connected.
- **Edge-Case Validation**: Server-side prevention of duplicate requests or self-connection attempts.
- **Invitations Manager**: Centralized inbox to accept or ignore incoming networking invites.

### 5. Career Opportunities & Job Board
- **Job Postings**: Alumni and Admins can publish full-time jobs, internships, remote roles, and contract openings.
- **Job Search & Filters**: Search opportunities by job title, company name, location, and job type tabs (`Full-time`, `Internship`, `Remote`, `Part-time`).
- **Direct Application**: One-click external application link integration.

### 6. Real-Time Messaging System
- **Supabase Realtime**: Instant 1-on-1 direct messaging powered by Supabase WebSocket replication.
- **Message History**: Persistent conversation logs per user pair.

### 7. Campus & Alumni Events Dashboard
- **Event Creation**: Alumni can organize and publish virtual or campus events.
- **Community Feed**: Interactive event feed displaying event dates, descriptions, and host profiles.

### 8. Analytics Dashboard
- **Real DB Metrics**: Dynamic calculations of Total Alumni, Active Connections, Pending Requests, and Open Opportunities.
- **Profile Strength Meter**: Automated percentage progress calculation based on filled profile fields.

### 9. Admin Management Console (`/admin`)
- **System Metrics**: Overview of total registered users, student vs. alumni breakdown, active job postings, events, and feed posts.
- **User Management**: Search registered users and manage user access with deletion controls.
- **Content Moderation**: Single-click removal of flagged posts, events, or job postings.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `@base-ui/react`, Sonner Toasts, Lucide Icons
- **Backend / API**: Next.js App Router REST API Routes (`/api/...`), Server Actions, `@supabase/ssr` Middleware
- **Database & Auth**: Supabase PostgreSQL, Row Level Security (RLS) Policies, PostgreSQL Triggers, Supabase Realtime Channels
- **Validation**: Zod & TypeScript interface schemas

---
## 📂 Project Structure

```
AlumniHub/
├── schema.sql                     # Supabase DDL SQL (Tables, Indexes, RLS Policies)
├── trigger.sql                    # Postgres trigger function for auto profile creation
├── package.json                   # Project dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── public/                        # Static assets & graphics
└── src/
    ├── middleware.ts              # Server-side auth route protection middleware
    ├── app/                       # Next.js App Router
    │   ├── globals.css            # Global CSS & Tailwind styling rules
    │   ├── layout.tsx             # Root Layout (Fonts & Toast Provider)
    │   ├── page.tsx               # Landing page
    │   ├── login/                 # Login page
    │   ├── signup/                # Registration page with Role Selection
    │   ├── (app)/                 # Authenticated Application Routes
    │   │   ├── layout.tsx         # Main App Shell (with Navbar)
    │   │   ├── dashboard/         # Feed, Real DB Metrics & Profile Strength Meter
    │   │   ├── opportunities/     # Job Board & Opportunity Posting Modal
    │   │   ├── events/            # Campus Events Feed & Event Modal
    │   │   ├── messages/          # Real-time 1-on-1 Direct Messaging
    │   │   ├── network/           # Connection Requests & User Categories
    │   │   ├── profile/           # User Profile View & Edit Modal
    │   │   │   └── [id]/          # Public User Profile Page
    │   │   ├── search/            # Directory Search & Multi-Parametric Filter
    │   │   └── admin/             # Admin Management & Moderation Console
    │   └── api/                   # Backend REST API Routes
    │       ├── auth/me/           # GET current user session & profile
    │       ├── alumni/            # GET filtered alumni/students list
    │       ├── opportunities/     # GET, POST, DELETE job opportunities
    │       ├── connections/       # GET, POST, PATCH, DELETE connection requests
    │       ├── events/            # GET, POST, DELETE events
    │       └── admin/             # Admin endpoints (users, content moderation)
    │           ├── users/         # GET all users, DELETE user
    │           └── content/       # DELETE post, event, or job content
    ├── components/                # Modular React UI Components
    │   ├── Navbar.tsx             # Main App Top Navigation Bar
    │   ├── ConnectButton.tsx      # Connection request toggle button
    │   ├── ConnectionRequests.tsx # Incoming connection invitations list
    │   ├── CreatePostBox.tsx      # Social feed post creation card
    │   └── ui/                    # Reusable primitive UI components (Button, Card, Input)
    └── lib/
        └── supabase/              # Supabase Client & Server Initializers
            ├── client.ts          # Browser Supabase Client
            ├── server.ts          # Server Component / API Supabase Client
            └── middleware.ts      # Auth Token Refresher
```

---

## ⚡ REST API Endpoint Reference

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/me` | `GET` | Authenticated | Returns current user session and profile metadata |
| `/api/alumni` | `GET` | Public / Auth | Search alumni/students with query params (`q`, `role`, `company`, `skill`, `batch`, `branch`) |
| `/api/opportunities` | `GET` | Authenticated | Fetch active job/internship opportunities with filters |
| `/api/opportunities` | `POST` | Alumni / Admin | Create a new job opportunity posting |
| `/api/opportunities` | `DELETE` | Author / Admin | Delete an opportunity posting |
| `/api/connections` | `GET` | Authenticated | Fetch user's pending invitations and active connections |
| `/api/connections` | `POST` | Authenticated | Send a connection request to another user |
| `/api/connections` | `PATCH` | Authenticated | Update connection status (`accepted` or `declined`) |
| `/api/connections` | `DELETE` | Authenticated | Remove or cancel a connection |
| `/api/events` | `GET` | Authenticated | Fetch upcoming campus/alumni events |
| `/api/events` | `POST` | Alumni / Admin | Create a new event |
| `/api/admin/users` | `GET` | Admin Only | Get platform analytics stats and all registered users |
| `/api/admin/users` | `DELETE` | Admin Only | Delete a user profile and access credentials |
| `/api/admin/content` | `DELETE` | Admin Only | Moderate and remove post, event, or job content |

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harshpratapsinghhh/AlumniHub.git
cd AlumniHub
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://private_key.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key
```

### 3. Database Setup (Supabase)
1. Open your Supabase project SQL Editor.
2. Run [`schema.sql`](./schema.sql) in the Supabase SQL Editor.
3. Run [`trigger.sql`](./trigger.sql) in the Supabase SQL Editor.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔮 Future Enhancements Roadmap

- **Mentorship Pairing Algorithm**: Match students with alumni based on target industry & skills.
- **Automated Email Notifications**: Email alerts for new connection requests and job postings.
- **Resume Builder & Feedback**: Allow students to submit resumes for alumni review.

---
