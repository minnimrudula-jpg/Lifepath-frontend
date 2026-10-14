# LifePath Frontend

React and Vite frontend for the LifePath personalized eligibility and opportunity discovery platform.

## Local development

1. Install Node.js supported by the project dependencies and run `npm install`.
2. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend API base URL. For local development, the default is `http://localhost:8080/api`.
3. Run `npm run dev`.

The frontend sends API requests to `VITE_API_BASE_URL`. When the variable is not set, development uses `http://localhost:8080/api`; production builds use the same-origin `/api` path.

## Production configuration

Set `VITE_API_BASE_URL` in the frontend hosting build environment to the deployed backend API base URL, including `/api` when that is the backend context path, for example `https://api.example.com/api`. Vite embeds this value at build time, so set it before running `npm run build`. Do not put backend credentials or secrets in `VITE_` variables; values with this prefix are public in the generated client bundle.

The app uses `BrowserRouter`. Configure the web host to serve `index.html` for client-side route requests (SPA fallback), while keeping static asset paths intact. Configure the backend for the deployed frontend origin, including CORS and the authentication settings it requires; those are backend/hosting tasks outside this frontend.

## Checks

- `npm run lint`
- `npm run build`
