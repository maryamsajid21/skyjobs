# SkyJobs — Freelance Job Bidding Marketplace
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** May 13, 2026  
**Group:** 02  
**Members:** MazzAhmed, Saba Mehreen, Maryam Sajid  
**Course:** Web Engineering  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [User Stories](#6-user-stories)
7. [System Architecture](#7-system-architecture)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Tech Stack](#11-tech-stack)
12. [Milestones & Timeline](#12-milestones--timeline)
13. [Out of Scope](#13-out-of-scope)

---

## 1. Project Overview

**SkyJobs** is a web-based freelance job bidding marketplace that connects clients who need work done with skilled freelancers who can do it. Clients post jobs, freelancers submit competitive bids, and clients select the best candidate. The platform manages the full lifecycle: job posting → bidding → hiring → completion → review.

### Problem Statement
Small businesses and individuals struggle to find skilled freelancers quickly, while talented freelancers have limited visibility to reach quality clients. Existing platforms (Upwork, Fiverr) are complex and fee-heavy. SkyJobs aims to provide a clean, fast, and transparent marketplace.

### Solution
A streamlined web application where:
- Clients post jobs with budgets and deadlines
- Freelancers browse and bid on jobs that match their skills
- Clients review bids and hire the best fit
- Both parties track project status in real time
- An admin panel ensures platform integrity

---

## 2. Goals & Objectives

| Goal | Metric |
|------|--------|
| Enable clients to post jobs in under 2 minutes | Time-to-post < 2 min |
| Allow freelancers to submit bids with a proposal | Bid submission form functional |
| Support end-to-end job lifecycle tracking | Status changes from Open → In Progress → Completed |
| Provide role-based access control | 3 roles: Client, Freelancer, Admin |
| Enable fast job discovery | Search + filter + pagination working |
| Give admins full platform oversight | Admin dashboard with user/job management |

---

## 3. User Roles & Personas

### 3.1 Client
- Posts jobs with title, description, budget range, deadline, and required skills
- Reviews submitted bids and freelancer profiles
- Hires a freelancer (accepts a bid)
- Tracks job progress and marks jobs as complete
- Leaves a review for the freelancer

### 3.2 Freelancer
- Creates a profile with skills, bio, portfolio, and hourly rate
- Browses and searches available jobs
- Submits bids with a proposed price and cover letter
- Manages active projects and communicates with clients
- Receives ratings and builds reputation

### 3.3 Admin
- Views and manages all users (clients and freelancers)
- Views, edits, or removes any job listing
- Monitors all bids and transactions
- Resolves disputes / flags content
- Accesses platform-wide analytics dashboard

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

| ID | Requirement |
|----|-------------|
| AUTH-01 | Users can register with name, email, password, and role selection (Client / Freelancer) |
| AUTH-02 | Users can log in with email and password |
| AUTH-03 | JWT-based session management (tokens expire after 24 hours) |
| AUTH-04 | Password hashing using bcrypt |
| AUTH-05 | Role-based access: routes and UI elements are shown/hidden based on role |
| AUTH-06 | Users can update their profile (name, bio, skills, profile picture) |
| AUTH-07 | Users can change their password |
| AUTH-08 | Admin-only routes protected server-side |

---

### 4.2 Job Listings (CRUD)

| ID | Requirement |
|----|-------------|
| JOB-01 | Client can Create a job post with: title, description, category, budget (min/max), deadline, required skills |
| JOB-02 | Client can Read / view their own job listings |
| JOB-03 | Client can Update a job post (only if no bids placed yet) |
| JOB-04 | Client can Delete a job post (only if no bids placed yet) |
| JOB-05 | Freelancer can view all open job listings |
| JOB-06 | Job status field: `open`, `in_progress`, `completed`, `cancelled` |
| JOB-07 | Jobs display: title, category, budget range, deadline, client name, number of bids |
| JOB-08 | Job detail page shows full description, required skills, and all submitted bids |

---

### 4.3 Bidding System (CRUD)

| ID | Requirement |
|----|-------------|
| BID-01 | Freelancer can submit a bid on an open job with: proposed price, cover letter, estimated delivery time |
| BID-02 | A freelancer can only submit one bid per job |
| BID-03 | Freelancer can edit their bid before it is accepted |
| BID-04 | Freelancer can withdraw (delete) their bid before it is accepted |
| BID-05 | Client can view all bids on their job with freelancer profile info |
| BID-06 | Client can accept a bid — job status changes to `in_progress`, other bids are automatically rejected |
| BID-07 | Bid status field: `pending`, `accepted`, `rejected`, `withdrawn` |
| BID-08 | Freelancer is notified when their bid is accepted or rejected |

---

### 4.4 Dashboard

| ID | Requirement |
|----|-------------|
| DASH-01 | **Client Dashboard:** Shows posted jobs, active projects, total spent, and quick action buttons |
| DASH-02 | **Freelancer Dashboard:** Shows active bids, active projects, total earned, and profile completion % |
| DASH-03 | **Admin Dashboard:** Shows total users, total jobs, total bids, recent activity, and flagged content |
| DASH-04 | Dashboards include summary cards (counts) and recent activity feed |

---

### 4.5 Status Tracking

| ID | Requirement |
|----|-------------|
| STAT-01 | Job lifecycle: `open` → `in_progress` → `completed` / `cancelled` |
| STAT-02 | Bid lifecycle: `pending` → `accepted` / `rejected` / `withdrawn` |
| STAT-03 | Client marks job as `completed` when work is delivered |
| STAT-04 | Status changes are timestamped and stored in the database |
| STAT-05 | Status is visually represented with color-coded badges in the UI |
| STAT-06 | Both client and freelancer can see real-time project status on the project detail page |

---

### 4.6 Search, Filter & Pagination

| ID | Requirement |
|----|-------------|
| SRCH-01 | Search jobs by keyword (title, description, skills) |
| SRCH-02 | Filter jobs by: category, budget range, deadline, job status |
| SRCH-03 | Sort jobs by: newest, budget (high/low), deadline (soonest) |
| SRCH-04 | Pagination: 10 jobs per page with page navigation controls |
| SRCH-05 | Search freelancers by name, skills (admin and client views) |
| SRCH-06 | URL reflects search/filter state (shareable links) |

---

### 4.7 Admin Panel

| ID | Requirement |
|----|-------------|
| ADM-01 | Admin can view a full list of all registered users with role, join date, and status |
| ADM-02 | Admin can suspend or reactivate a user account |
| ADM-03 | Admin can delete a user account |
| ADM-04 | Admin can view all job listings regardless of status |
| ADM-05 | Admin can remove any job listing |
| ADM-06 | Admin can view all bids across the platform |
| ADM-07 | Admin dashboard shows platform-level analytics: user counts, job counts, bid counts |
| ADM-08 | Admin can search and filter users and jobs |

---

### 4.8 Reviews & Ratings

| ID | Requirement |
|----|-------------|
| REV-01 | After a job is marked `completed`, client can leave a rating (1–5 stars) and review for the freelancer |
| REV-02 | Reviews are displayed on the freelancer's public profile |
| REV-03 | Average rating is calculated and shown on the freelancer's profile and on bid cards |
| REV-04 | Each job can only have one review |

---

### 4.9 Freelancer Profiles

| ID | Requirement |
|----|-------------|
| PROF-01 | Public freelancer profile page: name, bio, skills, average rating, reviews, portfolio links |
| PROF-02 | Freelancer sets their skills as a tag list |
| PROF-03 | Profile shows total jobs completed and total earnings (masked / approximate) |
| PROF-04 | Client can click a freelancer's name anywhere on the platform to view their profile |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Page load time < 3 seconds for any page |
| **Security** | Passwords hashed with bcrypt; JWT tokens for sessions; input sanitization on all forms |
| **Scalability** | Database and API designed to handle 1,000+ concurrent users |
| **Usability** | Responsive design — works on desktop, tablet, and mobile |
| **Reliability** | Graceful error handling; API returns meaningful error messages |
| **Maintainability** | Code follows MVC/component-based structure; consistent naming conventions |
| **Accessibility** | Basic WCAG 2.1 AA compliance — alt text on images, keyboard navigable forms |

---

## 6. User Stories

### Client Stories
```
As a client, I want to register an account so that I can post jobs.
As a client, I want to post a job with a title, description, and budget so that freelancers can bid on it.
As a client, I want to view all bids on my job so that I can compare proposals.
As a client, I want to accept a bid so that I can hire a freelancer.
As a client, I want to mark a job as complete so that payment is confirmed and I can leave a review.
As a client, I want a dashboard so that I can see all my active and past projects at a glance.
```

### Freelancer Stories
```
As a freelancer, I want to create a profile with my skills so that clients trust me.
As a freelancer, I want to browse and search open jobs so that I can find work that matches my expertise.
As a freelancer, I want to submit a bid with a cover letter so that I can pitch myself to clients.
As a freelancer, I want to edit or withdraw my bid so that I can adjust my proposal if needed.
As a freelancer, I want to see my active projects so that I can track what I am working on.
As a freelancer, I want to receive a notification when my bid is accepted so that I know to start work.
```

### Admin Stories
```
As an admin, I want to log in to a protected admin panel so that I can manage the platform.
As an admin, I want to view and manage all users so that I can enforce platform rules.
As an admin, I want to remove inappropriate job listings so that the platform stays professional.
As an admin, I want to see platform-wide analytics so that I can understand platform health.
```

---

## 7. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                    │
│              React.js (Vite) + Tailwind CSS             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST (JSON)
┌─────────────────────▼───────────────────────────────────┐
│                     BACKEND SERVER                       │
│              Node.js + Express.js                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │  Routes  │  │  Controllers│  │Middleware│             │
│   └──────────┘  └──────────┘  └──────────┘             │
│          Auth (JWT)   |   Role Guards                    │
└─────────────────────┬───────────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────────┐
│                     DATABASE                             │
│                   MongoDB Atlas                          │
│   Users | Jobs | Bids | Reviews | Notifications         │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | React + Vite | UI rendering, routing, state management |
| State Management | React Context / Redux Toolkit | Auth state, global data |
| Styling | Tailwind CSS | Responsive design |
| Backend | Node.js + Express | REST API, business logic |
| Auth | JWT + bcrypt | Token-based session, password hashing |
| Database | MongoDB + Mongoose | Data persistence |
| File Upload | Multer / Cloudinary | Profile pictures (optional) |

---

## 8. Database Schema

### 8.1 Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed, required)",
  "role": "Enum: ['client', 'freelancer', 'admin']",
  "bio": "String",
  "skills": ["String"],
  "profilePicture": "String (URL)",
  "portfolioLinks": ["String"],
  "hourlyRate": "Number",
  "averageRating": "Number (computed)",
  "totalJobsCompleted": "Number",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 8.2 Jobs Collection
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "category": "String (required)",
  "requiredSkills": ["String"],
  "budgetMin": "Number (required)",
  "budgetMax": "Number (required)",
  "deadline": "Date (required)",
  "status": "Enum: ['open', 'in_progress', 'completed', 'cancelled']",
  "clientId": "ObjectId (ref: Users)",
  "hiredFreelancerId": "ObjectId (ref: Users, nullable)",
  "acceptedBidId": "ObjectId (ref: Bids, nullable)",
  "totalBids": "Number (computed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 8.3 Bids Collection
```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId (ref: Jobs)",
  "freelancerId": "ObjectId (ref: Users)",
  "proposedPrice": "Number (required)",
  "coverLetter": "String (required)",
  "estimatedDeliveryDays": "Number (required)",
  "status": "Enum: ['pending', 'accepted', 'rejected', 'withdrawn']",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 8.4 Reviews Collection
```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId (ref: Jobs, unique)",
  "clientId": "ObjectId (ref: Users)",
  "freelancerId": "ObjectId (ref: Users)",
  "rating": "Number (1–5, required)",
  "comment": "String",
  "createdAt": "Date"
}
```

### 8.5 Notifications Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "message": "String",
  "type": "Enum: ['bid_accepted', 'bid_rejected', 'job_completed', 'new_bid']",
  "isRead": "Boolean (default: false)",
  "relatedJobId": "ObjectId (ref: Jobs, nullable)",
  "createdAt": "Date"
}
```

---

## 9. API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Authenticated | Get current user profile |
| PUT | `/me` | Authenticated | Update current user profile |
| PUT | `/me/password` | Authenticated | Change password |

### Job Routes — `/api/jobs`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all open jobs (with search, filter, pagination) |
| POST | `/` | Client | Create a new job |
| GET | `/:id` | Public | Get single job detail with bids |
| PUT | `/:id` | Client (owner) | Update job (if no bids) |
| DELETE | `/:id` | Client (owner) | Delete job (if no bids) |
| GET | `/my/jobs` | Client | Get all jobs posted by the logged-in client |
| PATCH | `/:id/complete` | Client (owner) | Mark job as completed |

### Bid Routes — `/api/bids`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Freelancer | Submit a bid on a job |
| GET | `/job/:jobId` | Client (owner) | Get all bids on a specific job |
| GET | `/my/bids` | Freelancer | Get all bids submitted by the logged-in freelancer |
| PUT | `/:id` | Freelancer (owner) | Edit a pending bid |
| DELETE | `/:id` | Freelancer (owner) | Withdraw a pending bid |
| PATCH | `/:id/accept` | Client (owner) | Accept a bid |

### User / Profile Routes — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:id` | Public | Get a freelancer's public profile |
| GET | `/:id/reviews` | Public | Get all reviews for a freelancer |

### Review Routes — `/api/reviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Client | Leave a review for a completed job |

### Admin Routes — `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | Get all users (paginated, searchable) |
| PATCH | `/users/:id/suspend` | Admin | Suspend a user account |
| PATCH | `/users/:id/activate` | Admin | Reactivate a user account |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/jobs` | Admin | Get all jobs regardless of status |
| DELETE | `/jobs/:id` | Admin | Remove a job listing |
| GET | `/bids` | Admin | Get all bids platform-wide |
| GET | `/stats` | Admin | Platform analytics summary |

---

## 10. UI/UX Requirements

### 10.1 Pages & Views

| Page | Role | Description |
|------|------|-------------|
| Landing Page | Public | Hero section, how it works, CTA to register |
| Register | Public | Form: name, email, password, role selection |
| Login | Public | Form: email, password |
| Job Listings | Public/Freelancer | Grid/list of jobs with search, filter, pagination |
| Job Detail | Public | Full job info + bid list (bids visible to client only) |
| Post a Job | Client | Form to create a new job |
| Edit Job | Client | Pre-filled form to update job |
| My Jobs | Client | Table of all jobs posted by client with status badges |
| Bid Detail | Client | View all bids on a job, accept a bid |
| Submit Bid | Freelancer | Form: price, cover letter, delivery time |
| My Bids | Freelancer | List of all submitted bids with status |
| Client Dashboard | Client | Summary cards + recent activity |
| Freelancer Dashboard | Freelancer | Summary cards + active bids/projects |
| Freelancer Profile | Public | Public profile page |
| Admin Dashboard | Admin | Platform stats + recent users/jobs |
| Admin Users | Admin | Manage users table |
| Admin Jobs | Admin | Manage jobs table |
| 404 Page | All | Not found page |

### 10.2 Design Guidelines

- **Color Palette:** Primary blue (`#2563EB`), success green (`#16A34A`), warning amber (`#D97706`), danger red (`#DC2626`), neutral grays
- **Typography:** Inter or Poppins font family
- **Status Badges:** Color-coded pills — Open (blue), In Progress (amber), Completed (green), Cancelled (red)
- **Responsive:** Mobile-first design; sidebar collapses on mobile
- **Navigation:** Top navbar (logo, search, login/register or user avatar with dropdown)
- **Forms:** Inline validation with error messages under each field
- **Loading States:** Skeleton loaders for async data
- **Empty States:** Friendly illustrations/messages when lists are empty

---

## 11. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend Framework | React.js (Vite) | Fast dev build, component-based |
| CSS | Tailwind CSS | Utility-first, consistent UI |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | API calls with interceptors |
| State | React Context API | Auth and user state |
| Backend | Node.js + Express.js | Lightweight REST API |
| Database | MongoDB + Mongoose | Flexible schema, easy setup |
| Auth | JWT + bcrypt | Stateless token auth |
| Validation | express-validator | Server-side input validation |
| Environment | dotenv | Config management |
| Dev Tools | Nodemon, ESLint, Prettier | DX improvements |

---

## 12. Milestones & Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1 — Setup** | Project structure, DB connection, env config, React boilerplate | Week 1 |
| **Phase 2 — Auth** | Register, login, JWT, role guards, protected routes (frontend + backend) | Week 1–2 |
| **Phase 3 — Jobs CRUD** | Post, view, edit, delete jobs; Job detail page; My Jobs page | Week 2–3 |
| **Phase 4 — Bidding** | Submit bid, view bids, accept bid, withdraw bid, bid status updates | Week 3–4 |
| **Phase 5 — Dashboard** | Client dashboard, freelancer dashboard, status tracking, notifications | Week 4–5 |
| **Phase 6 — Search & Filter** | Search bar, filters, sort, pagination (frontend + backend query params) | Week 5 |
| **Phase 7 — Admin Panel** | Admin auth guard, user management, job management, stats dashboard | Week 6 |
| **Phase 8 — Reviews & Profiles** | Leave review, public profile page, average rating calculation | Week 6–7 |
| **Phase 9 — Polish** | Responsive design, error handling, loading states, 404 page | Week 7 |
| **Phase 10 — Testing** | Manual testing of all flows, bug fixes, final demo prep | Week 8 |

---

## 13. Out of Scope

The following features are **not** included in v1.0 but could be added later:

- Real-time messaging / chat between client and freelancer
- Payment gateway integration (Stripe / PayPal)
- Email notifications (SendGrid)
- Video calls or screen sharing
- Mobile apps (iOS / Android)
- Escrow / milestone payment system
- Freelancer skill verification / tests
- Social login (Google / GitHub OAuth)
- File attachments on jobs or bids

---

*End of Document*  
*SkyJobs PRD v1.0 — Group 02 — Web Engineering*
