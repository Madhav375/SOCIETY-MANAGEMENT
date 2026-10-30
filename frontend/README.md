# Smart Society: Frontend (React + Vite)

React 18, React Router, Context API (auth + toasts). Talks to the backend only through `src/services/api.js`.

```bash
cp .env.example .env        # VITE_API_URL=http://localhost:3000
npm install
npm run dev                 # http://localhost:5173
npm run build               # → dist/
```

## Structure
* `src/pages`: Login, Signup, Dashboard, Services, Complaints, NewComplaint, AdminDashboard
* `src/components`: Sidebar, Navbar (mobile bar), Footer, ProtectedRoute, StatCard, Loading, plus small shared pieces
* `src/context`: `AuthContext` (session restore on refresh, login/signup/logout, 401 handling), `ToastContext`
* `src/services/api.js`: the single fetch wrapper (`credentials: "include"`, error mapping for 401/403/404/5xx and network failures)
* `src/index.css`: the original stylesheet, unchanged in look

## Deploy on Vercel
1. Import the repo, set **Root Directory** to `frontend`. Framework: Vite.
2. Build command `npm run build` · Output directory `dist` (already in `vercel.json`, which also adds the SPA fallback so `/complaints` etc. survive a refresh).
3. Environment variable: `VITE_API_URL=https://<your-backend>.onrender.com`.
4. Put the resulting Vercel URL in the backend's `FRONTEND_URL` and redeploy the backend.

### Third-party cookie note
Vercel and Render are different sites, so the session cookie is cross-site (`SameSite=None; Secure`). Chrome currently allows this, but **Safari and some privacy settings block third-party cookies**, and users there would fail to stay signed in. The robust fix is to make the API same-origin via a Vercel rewrite:
1. In `vercel.json`, add before the SPA rule: `{ "source": "/api/:path*", "destination": "https://<your-backend>.onrender.com/api/:path*" }`
2. Leave `VITE_API_URL` empty (the app then calls relative `/api/...`).
3. Set the backend's `FRONTEND_URL` to your Vercel URL as before.
