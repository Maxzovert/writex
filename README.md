# Writex

Modern blog/knowledge platform with a React (Vite) frontend and an Express + MongoDB backend.

- Live demo: `https://writtex.onrender.com/`

## Tech Stack
- Frontend: React 19, Vite, React Router, Tailwind CSS, TipTap, Framer Motion
- Backend: Node.js, Express, Mongoose (MongoDB), JWT, bcryptjs, dotenv, cors
- Tooling: ESLint, Concurrently, Nodemon

## Monorepo Structure
```
.
├── Backend/            # Express API server
├── writex/             # React (Vite) web app
├── package.json        # Root scripts (concurrently runs both apps)
└── README.md
```

## Prerequisites
- Node.js 18+ and npm
- MongoDB connection string

## Environment Variables

Create a `.env` file in `Backend/` with at least:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-strong-secret
```

Optionally, in `writex/` create `.env` for frontend settings:
```
VITE_API_URL=http://localhost:5000
# If you use Supabase in the app:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

## Install
From the repository root:
```bash
npm install
```
This installs the root dev tool `concurrently`. Then install app-level deps (first run will trigger installs when you start, but you can also do it explicitly):
```bash
cd Backend && npm install
cd ../writex && npm install
```

## Development
From the repository root you can start both apps together:
```bash
npm run dev
```
This runs (per root `package.json`):
- `server`: `cd writex && npm run dev` (starts Vite dev server)
- `client`: `cd backend && npm start` (starts Express via Nodemon)

Run them separately if you prefer:
```bash
# Backend
cd Backend
npm start

# Frontend
cd writex
npm run dev
```

## Build (Frontend)
```bash
cd writex
npm run build
```
Then preview locally:
```bash
npm run preview
```

## Scripts Reference
- Root: `npm run dev` – start frontend + backend concurrently
- Backend: `npm start` – run Express with Nodemon
- Frontend: `npm run dev` | `npm run build` | `npm run preview`

## Folder Highlights
- `Backend/models/` – Mongoose schemas
- `Backend/controller/` – Route controllers
- `writex/src/` – React app code (routes, components, TipTap editor, styles)

## Notes
- Ensure the backend `PORT` matches the frontend `VITE_API_URL` if calling APIs locally.
- If CORS is enabled, add your frontend origin in the backend CORS configuration.

## Contributing
Issues and PRs are welcome. Please run linters and ensure builds pass before submitting.

## License
This project is licensed under the MIT License.
