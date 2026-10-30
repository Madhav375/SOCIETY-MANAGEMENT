// Single place where the frontend talks to the backend REST API.
// VITE_API_URL: backend origin (e.g. https://your-backend.onrender.com).
// Leave it empty to call same-origin "/api" (useful with a Vercel rewrite proxy).

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

let onUnauthorized = null;
/** AuthContext registers a callback so any 401 clears the signed-in user. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

const FALLBACK = {
  400: "Please check the details and try again.",
  401: "Please sign in.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That already exists.",
  413: "That file is too large.",
  429: "Too many attempts. Please wait a moment.",
};

async function request(path, { method = "GET", body, form, raw = false, silent401 = false } = {}) {
  const init = {
    method,
    credentials: "include", // send the HttpOnly session cookie cross-origin
    headers: { "X-Requested-With": "fetch" }, // required by the backend's CSRF check
  };
  if (form) {
    init.body = form; // multipart: browser sets the boundary header
  } else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    const err = new Error("Can't reach the server. Check your connection and try again.");
    err.status = 0;
    throw err;
  }

  if (raw && res.ok) return res;

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok || data.ok === false) {
    const message =
      data.error || (res.status >= 500 ? "Something went wrong on our side. Please try again." : FALLBACK[res.status]) || "Something went wrong. Please try again.";
    const err = new Error(message);
    err.status = res.status;
    if (res.status === 401 && !silent401 && onUnauthorized) onUnauthorized();
    throw err;
  }
  return data;
}

export const api = {
  health: () => request("/api/health"),

  auth: {
    me: () => request("/api/auth/me", { silent401: true }),
    login: (role, identifier, password) =>
      request("/api/auth/login", { method: "POST", body: { role, identifier, password }, silent401: true }),
    signup: (payload) => request("/api/auth/signup", { method: "POST", body: { role: "resident", ...payload }, silent401: true }),
    logout: () => request("/api/auth/logout", { method: "POST", silent401: true }),
  },

  dashboard: () => request("/api/dashboard"),

  complaints: {
    list: (scope = "mine") => request(`/api/complaints?scope=${scope}`).then((d) => d.complaints),
    create: (formData) => request("/api/complaints", { method: "POST", form: formData }).then((d) => d.complaint),
    update: (id, patch) =>
      request(`/api/complaints/${encodeURIComponent(id)}`, { method: "PATCH", body: patch }).then((d) => d.complaint),
    /** Returns an object URL for the attached photo (cookie auth means <img src> can't be used cross-site). */
    async photoUrl(id) {
      const res = await request(`/api/complaints/${encodeURIComponent(id)}/photo`, { raw: true });
      return URL.createObjectURL(await res.blob());
    },
  },

  services: {
    mine: () => request("/api/services").then((d) => d.services),
    create: (serviceId) => request("/api/services", { method: "POST", body: { serviceId } }).then((d) => d.service),
    all: () => request("/api/services/all").then((d) => d.services),
    update: (id, patch) => request(`/api/services/${encodeURIComponent(id)}`, { method: "PATCH", body: patch }).then((d) => d.service),
  },

  admin: {
    dashboard: () => request("/api/admin/dashboard"),
    users: () => request("/api/admin/users").then((d) => d.users),
    resetDemo: () => request("/api/admin/reset-demo", { method: "POST" }),
  },
};
