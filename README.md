# Writex

**Writex** is a modern blogging platform where people can write, save drafts, publish posts, follow authors, comment, and organize blogs into folders.

Live demo: [https://writtex.onrender.com/](https://writtex.onrender.com/)

This README explains the project in simple language, then goes deeper into the frontend, backend, database, writing canvas (editor), and how data moves and is stored.

---

## Table of contents

1. [What is Writex?](#what-is-writex)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [How the app works (big picture)](#how-the-app-works-big-picture)
5. [Frontend](#frontend)
6. [Backend](#backend)
7. [Database](#database)
8. [Writing canvas (TipTap editor)](#writing-canvas-tiptap-editor)
9. [Main user flows](#main-user-flows)
10. [How data is stored](#how-data-is-stored)
11. [Setup & running locally](#setup--running-locally)
12. [Environment variables](#environment-variables)
13. [API overview](#api-overview)
14. [Notes for contributors](#notes-for-contributors)

**Auth0 portal setup (Google + email + forgot password):** see [docs/AUTH0_SETUP.md](docs/AUTH0_SETUP.md) for step-by-step dashboard instructions before wiring Auth0 into the app.

---

## What is Writex?

Writex lets users:

- Create an account and sign in
- Write blog posts in a rich text editor (headings, lists, images, tables, code blocks, and more)
- Save drafts automatically while writing
- Publish publicly or keep a post personal (private)
- Browse blogs, open a blog page, like, comment, and share
- Follow other authors and see a following feed
- Upload a profile picture and edit bio / social links
- Organize blogs into folders (own posts and saved posts)
- Bookmark text passages while reading or writing (stored on the device)

In short: **React app talks to an Express API, which stores everything in MongoDB.** Images are uploaded to Cloudinary.

---

## Tech stack

### Frontend (`writex/`)

| Layer | Technology | Why it is used |
|--------|------------|----------------|
| UI library | **React 19** | Build screens and interactive components |
| Build tool | **Vite 6** | Fast local development and production builds |
| Routing | **React Router 7** | Pages like `/write`, `/blogs`, `/blog/:id` |
| Styling | **Tailwind CSS 4** | Utility CSS for layout and design |
| Editor | **TipTap** (ProseMirror) | Rich writing canvas |
| HTTP | **Axios** | Call the backend API |
| Auth state | **React Context** (`authContext`) | Keep logged-in user available app-wide |
| UI pieces | **Radix UI**, Lucide / react-icons | Dialogs, menus, icons |
| Motion | **Framer Motion / Motion** | Light animations |
| Toasts | **react-toastify** | Success / error messages |
| Images | **Cloudinary** (unsigned upload) | Host profile and blog images |

### Backend (`Backend/`)

| Layer | Technology | Why it is used |
|--------|------------|----------------|
| Runtime | **Node.js** | Run the server |
| Framework | **Express 5** | HTTP routes and middleware |
| Database ODM | **Mongoose 8** | Talk to MongoDB with schemas |
| Auth | **JWT** (`jsonwebtoken`) + **bcryptjs** | Login tokens and hashed passwords |
| Config | **dotenv** | Secrets and config from `.env` |
| CORS | **cors** | Allow the frontend origin to call the API |
| Dev reload | **Nodemon** | Restart server when files change |

### Database & storage

| Service | Role |
|---------|------|
| **MongoDB** | Main database (users, blogs, folders, notifications, shares) |
| **Cloudinary** | Image files (profile photos, blog images) — URLs are saved in MongoDB |

### Root tooling

- **concurrently** — start frontend and backend together with `npm run dev` from the repo root

---

## Project structure

```
Writex/
├── Backend/                 # Express + MongoDB API
│   ├── index.js             # Server entry point
│   ├── config/              # DB connection
│   ├── models/              # MongoDB schemas (User, Blog, Folder, …)
│   ├── routes/              # URL → controller mapping
│   ├── controller/          # Business logic
│   ├── middleware/          # Auth (JWT protect / optional auth)
│   └── utils/               # Helpers (e.g. notifications)
│
├── writex/                  # React (Vite) web app
│   ├── src/
│   │   ├── App.jsx          # Routes
│   │   ├── main.jsx         # Providers (theme, router, auth)
│   │   ├── App/             # Main app pages (dashboard, write, blogs, …)
│   │   ├── Pages/           # Auth, home, about
│   │   ├── components/      # UI + TipTap editor pieces
│   │   ├── context/         # Auth & theme
│   │   ├── lib/             # API helpers, Cloudinary, bookmarks
│   │   └── hooks/           # Custom hooks
│   └── package.json
│
├── package.json             # Root: run both apps
└── README.md
```

---

## How the app works (big picture)

```
┌─────────────┐         HTTPS / JSON          ┌─────────────┐
│   Browser   │  ←──────────────────────────→ │   Express   │
│  (React)    │     Authorization: Bearer     │   Backend   │
└─────────────┘              JWT              └──────┬──────┘
       │                                             │
       │ upload images                               │ Mongoose
       ▼                                             ▼
┌─────────────┐                               ┌─────────────┐
│ Cloudinary  │                               │   MongoDB   │
│ (image CDN) │                               │  documents  │
└─────────────┘                               └─────────────┘
```

1. User opens the React app.
2. If a token exists in `localStorage`, the app loads the user profile from the API.
3. Writing, publishing, liking, commenting, etc. send JSON to Express routes.
4. Express checks JWT when needed, then reads/writes MongoDB.
5. Images go to Cloudinary first; only the image **URL** is stored in the database.

---

## Frontend

### Entry and providers

- `writex/src/main.jsx` wraps the app with:
  - **ThemeProvider** — light / dark theme
  - **BrowserRouter** — client-side routes
  - **AuthProvider** — current user + `refreshUser()`

### Routes (`writex/src/App.jsx`)

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Public | Marketing / home |
| `/signup`, `/login` | Public (guests) | Create account / sign in |
| `/blogs` | Public | Browse published blogs |
| `/blog/:id` | Public | Read one blog (likes, comments, focus mode) |
| `/author/:username` | Public | Author profile + their public posts |
| `/about` | Public | About page |
| `/dashboard` | Private | Logged-in home |
| `/write` | Private | Create or edit a blog |
| `/myblogs` | Private | Your posts + library / folders |
| `/profile` | Private | Your profile, bio, profile picture |
| `/community` | Private | Community-related UI |

**Private routes** require a `token` in `localStorage`.  
**Public auth routes** send logged-in users to `/dashboard`.

### Important frontend areas

- **Navbar** (`App/Components/Navbar.jsx`) — navigation, notifications, profile avatar
- **Write page** (`App/WriteBlog/WriteBLog.jsx`) — editor, auto-save, draft / publish dialogs
- **Blog list & detail** — public reading experience
- **TipTap SimpleEditor** — the actual writing canvas
- **Bookmarks** — highlight passages; saved in browser `localStorage` (not MongoDB)
- **Folders** — organize own/saved blogs via backend folder APIs

### Auth on the frontend

1. Login / signup returns a JWT.
2. Token is saved: `localStorage.setItem("token", …)`.
3. Axios sends `Authorization: Bearer <token>` on requests.
4. `refreshUser()` calls `GET /users/profile-stats` and stores the full user (including `profileImage`) in context.
5. Logout clears the token and user state.

---

## Backend

### Entry (`Backend/index.js`)

- Connects to MongoDB
- Enables CORS for local Vite ports and the production site
- Parses JSON bodies (default limit **12mb** so long posts / many image URLs fit)
- Mounts route groups:

| Mount path | Purpose |
|------------|---------|
| `/users` | Auth, profile, follow |
| `/blog/` | Your blogs + folders / library (auth) |
| `/public/posts/` | Public blog listing and reading |
| `/api/interactions/` | Likes, comments, views, shares |
| `/api/notifications` | In-app notifications |

Health checks: `GET /test`, `GET /blog/test`.

### Middleware

- **`protectRoute`** — requires a valid JWT; attaches `req.user`
- **`optionalAuth`** — JWT optional (e.g. public profile with “following” info)

### Controllers

Business logic lives under `Backend/controller/`:

- Users — signup, login, profile, follow
- Posts — create / update / delete blogs, folders
- Public posts — list and fetch blogs
- Interactions — likes, comments, replies, views, shares
- Notifications — list and mark as read

---

## Database

Writex uses **MongoDB** with **Mongoose** schemas in `Backend/models/`.

### User (`userModel.js`)

Stores account and profile data.

| Field | Meaning |
|-------|---------|
| `username`, `email` | Identity |
| `password` | Hashed with bcrypt before save |
| `profileImage` | Cloudinary URL (string) |
| `bio`, `socialLinks` | Profile extras |
| `followers`, `following` | Arrays of User IDs |
| `createdAt` | When the account was created |

### Blog (`postModel.js`)

Stores each post.

| Field | Meaning |
|-------|---------|
| `title` | Post title |
| `content` | **Mixed** type — TipTap JSON document (see below) |
| `mainImage` | Cover image URL (optional) |
| `author` | Reference to User |
| `status` | `draft` \| `personal` \| `published` \| `archived` |
| `category` | e.g. Tech, Health, General |
| `description` | Short summary shown in lists |
| `slug` | Unique URL-friendly string |
| `likes` | Array of User IDs |
| `comments` | Nested comments + replies + likes |
| `viewCount`, `uniqueViews` | View tracking |
| `createdAt`, `updatedAt`, `publishedAt` | Timestamps |

**Status meanings (simple):**

- **draft** — work in progress; not shown as a public blog
- **personal** — finished but private to the author
- **published** — visible in public blog lists
- **archived** — supported in the schema; not the main write UI option

### BlogFolder & FolderItem

- **BlogFolder** — a folder owned by a user (name, color, parent, pin, sort order)
- **FolderItem** — links a blog into a folder (`own` or `saved`)

### BlogShare

Records that a user shared a blog (unique per user + blog). Used for feed / share features.

### Notification

| Field | Meaning |
|-------|---------|
| `recipient`, `sender` | Who gets it / who triggered it |
| `type` | `follow` \| `share` \| `like` \| `comment` |
| `blog` | Related post (when relevant) |
| `message`, `read` | Text and read state |

---

## Writing canvas (TipTap editor)

The “canvas” is the **TipTap rich text editor** on the Write page.

**File:** `writex/src/components/tiptap-templates/simple/simple-editor.tsx`

### What you can do in the editor

- Headings, bold / italic / underline / strike
- Lists, task lists, blockquotes
- Text alignment
- Links, highlights
- Images (upload via Cloudinary)
- Tables
- Code blocks with syntax highlighting (lowlight)
- Bookmarks on selected text (local decorations)

### How content is represented

TipTap stores content as a **JSON document**, not as raw HTML.

Example shape:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Hello world" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is ", "marks": [] },
        { "type": "text", "text": "bold", "marks": [{ "type": "bold" }] }
      ]
    }
  ]
}
```

When you save or publish:

1. Frontend calls `editor.getJSON()`
2. That object is sent as `content` in the blog API payload
3. MongoDB stores it in `Blog.content` (`Schema.Types.Mixed`)

When you open a blog to read:

1. Frontend loads the blog from the API
2. Blog detail page walks the TipTap JSON and renders React elements (paragraphs, headings, images, tables, etc.)

### Images in the canvas

1. User picks an image in the editor
2. Frontend uploads the file to **Cloudinary** (`lib/cloudinary-storage.ts`)
3. Cloudinary returns a `secure_url`
4. TipTap inserts an image node with that URL
5. The first uploaded image can also become `mainImage` (cover) for the post

Only URLs are stored in MongoDB — not binary image data.

### Bookmarks (client-only)

Bookmarks are **not** written to MongoDB. They live in the browser under keys like:

`writex_bookmarks_{userId}_{documentId}`

Document IDs:

- New draft: `write-new-draft`
- After first server save: `blog-{mongoId}` (bookmarks can be migrated)

---

## Main user flows

### 1. Sign up / login

```
User fills form
  → POST /users/signup or /users/login
  → Backend checks password / creates user
  → Returns JWT
  → Frontend saves token
  → refreshUser() loads profile (username, profileImage, …)
  → Redirect to /dashboard
```

### 2. Write and auto-save draft

```
User types in TipTap
  → After ~1s idle, auto-save runs
  → content = editor.getJSON()
  → POST /blog/addblog  (first time) or PUT /blog/updateblog/:id
  → status: "draft"
  → Local backup also written to localStorage (writex_draft_backup)
```

If the tab closes suddenly, a keepalive request + local backup reduce data loss.

### 3. Publish

```
User opens Publish dialog
  → Must fill title + short description + have content
  → Chooses visibility: published (public) or personal (private)
  → Same add/update blog API with chosen status
  → Draft backup cleared
  → Navigate to My Blogs (when editing)
```

### 4. Read a blog

```
Visitor opens /blog/:id
  → GET public blog (+ interactions)
  → TipTap JSON rendered on the page
  → Can like, comment, reply, share (if logged in)
  → Optional reading / focus mode
```

### 5. Profile picture

```
User uploads image on Profile page
  → Upload file to Cloudinary
  → PUT /users/profile-image { profileImage: url }
  → Auth context updated
  → Navbar avatar shows the new URL
```

### 6. Follow & notifications

```
Follow author → POST /users/:userId/follow
  → Notification created for the other user
  → Notification panel polls / lists /api/notifications
```

---

## How data is stored

### In MongoDB (server)

| What | Where | Format |
|------|--------|--------|
| Accounts | `users` collection | Documents with hashed password |
| Blog body | `blogs.content` | TipTap JSON object |
| Cover image | `blogs.mainImage` | String URL |
| Profile photo | `users.profileImage` | String URL |
| Likes | `blogs.likes` | Array of user ObjectIds |
| Comments | `blogs.comments` | Nested subdocuments |
| Folders | `blogfolders` + `folderitems` | Folder tree + links to blogs |
| Notifications | `notifications` | Separate documents |
| Shares | `blogshares` | User + blog pairs |

### Outside MongoDB

| What | Where |
|------|--------|
| Image files | Cloudinary CDN |
| Auth session token | Browser `localStorage` (`token`) |
| Draft crash backup | Browser `localStorage` (`writex_draft_backup`) |
| Reading/writing bookmarks | Browser `localStorage` |

### What is *not* stored as HTML

The writing canvas does **not** save a full HTML page into the database. It saves structured TipTap JSON so the app can edit and render content reliably.

---

## Setup & running locally

### Prerequisites

- Node.js **18+** and npm
- A MongoDB database (local or Atlas)
- Cloudinary account (cloud name + unsigned upload preset) for images

### Install

From the repository root:

```bash
npm install
cd Backend && npm install
cd ../writex && npm install
```

### Configure env files

See [Environment variables](#environment-variables) below.

### Run both apps

From the root:

```bash
npm run dev
```

Note: in the root `package.json`, the script names are swapped historically:

- `server` starts the **frontend** (Vite)
- `client` starts the **backend** (Express)

Or run separately:

```bash
# Terminal 1 — API
cd Backend
npm start

# Terminal 2 — UI
cd writex
npm run dev
```

Typical URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Build frontend for production

```bash
cd writex
npm run build
npm run preview
```

---

## Environment variables

### Backend — `Backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JSON_BODY_LIMIT=12mb
```

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string (used in `config/db.js`) |
| `JWT_SECRET` | Signs and verifies login tokens |
| `JSON_BODY_LIMIT` | Max JSON body size (default `12mb`) |

### Frontend — `writex/.env`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Base URL for Axios / API calls |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |

Make sure `VITE_API_BASE_URL` matches the backend port, and that your frontend origin is allowed in the backend CORS list.

---

## API overview

### Users (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | No | Create account |
| POST | `/login` | No | Sign in, get JWT |
| POST | `/logout` | No | Logout response |
| GET | `/profile-stats` | Yes | Profile + stats |
| PUT | `/profile` | Yes | Update username / bio / social |
| PUT | `/profile-image` | Yes | Set profile image URL |
| GET | `/public/:username` | Optional | Public profile |
| GET | `/public/:username/blogs` | Optional | Author’s public blogs |
| POST/DELETE | `/:userId/follow` | Yes | Follow / unfollow |

### Blogs — authenticated (`/blog/`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/addblog` | Create blog |
| GET | `/myblogs` | Current user’s blogs |
| PUT | `/updateblog/:id` | Update blog |
| DELETE | `/deleteblog/:id` | Delete blog |
| GET/POST/PUT/DELETE | `/folders…`, `/library…` | Folders & saved library |

### Public posts (`/public/posts/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/blogs` | List published blogs |
| GET | `/blog/:id` | Get blog by ID |
| GET | `/:slug` | Get blog by slug |
| GET | `/following` | Following feed (auth) |

### Interactions (`/api/interactions/`)

Views, likes, comments, replies, shares on a blog.

### Notifications (`/api/notifications`)

List notifications, unread count, mark read.

---

## Notes for contributors

- Prefer clear, small pull requests.
- Run the frontend linter before submitting: `cd writex && npm run lint`.
- Ensure the frontend build succeeds: `cd writex && npm run build`.
- Do not commit real secrets (`.env` files with production keys).
- Blog `content` must remain TipTap-compatible JSON when saving from the Write page.
- Image uploads depend on Cloudinary env vars; without them, image features will fail.

---

## License

This project is licensed under the MIT License.

---

## Quick mental model

> **Writex = React writing UI + TipTap JSON canvas + Express API + MongoDB documents + Cloudinary image URLs + JWT login.**

If you can remember that, you already understand how the pieces fit together.
