# SkyJobs — Claude Dev Guide

## Project
Freelance Job Bidding Marketplace. Three roles: Client, Freelancer, Admin.
Stack: React + Vite + Tailwind CSS (frontend) | Node + Express + Sequelize + PostgreSQL (backend)

## Running the project
```
# Backend  (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

## Frontend Rules (follow strictly)

### Component structure
- One component per file, named same as file (PascalCase)
- Pages live in `src/pages/`, reusable UI in `src/components/`
- Keep components small — extract if JSX > 60 lines

### Tailwind usage
- Never write custom CSS unless Tailwind cannot do it
- Use the design tokens below — do not use arbitrary colors
- Always mobile-first: `sm:` prefix for tablet, `md:` for desktop

### Design tokens (always use these)
| Purpose | Class |
|---------|-------|
| Primary action | `bg-blue-600 hover:bg-blue-700 text-white` |
| Success | `bg-green-600 text-white` / `text-green-600` |
| Warning | `bg-amber-500 text-white` / `text-amber-600` |
| Danger | `bg-red-600 text-white` / `text-red-600` |
| Page background | `bg-gray-50` |
| Card background | `bg-white` |
| Border | `border border-gray-200` |
| Text primary | `text-gray-900` |
| Text muted | `text-gray-500` |
| Rounded cards | `rounded-xl shadow-sm` |
| Input base | `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Button base | `px-4 py-2 rounded-lg text-sm font-medium transition-colors` |

### Status badges (always use StatusBadge component)
- open → blue, in_progress → amber, completed → green, cancelled → red
- pending → gray, accepted → green, rejected → red, withdrawn → gray

### Forms
- Always show error messages inline under each field
- Disable submit button while loading (show spinner)
- Use controlled inputs with useState

### API calls
- Always use `src/api/axios.js` instance (never raw fetch)
- Handle loading + error state on every async call
- Show user-friendly error messages from `error.response.data.message`

### No inline styles — ever.
### No console.log left in committed code.
### No TODO comments — either implement or remove.

## Backend Rules

### File layout
```
src/
  models/       Sequelize models
  controllers/  Business logic only, no SQL in routes
  routes/       Express routers, thin — just call controller
  middleware/   auth.js (verify JWT), role.js (requireRole)
  config/       db.js
```

### Responses
Always respond with `{ success, message, data }` shape:
```js
res.json({ success: true, data: result });
res.status(400).json({ success: false, message: "..." });
```

### Auth middleware
- `protect` — verifies JWT, attaches `req.user`
- `requireRole(...roles)` — checks `req.user.role`

### Validation
Use express-validator on every POST/PUT route.

## Database (PostgreSQL via Sequelize)
- DB name: `skyjobs`
- `sequelize.sync({ alter: true })` in development
- All models use `timestamps: true`
- Skills stored as `DataTypes.ARRAY(DataTypes.TEXT)` (Postgres native array)
