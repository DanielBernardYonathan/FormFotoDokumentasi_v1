// Gunakan environment variable, fallback ke localhost saat dev
const BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

// === LOGIN ===
export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Server error");

  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "Login gagal");

  localStorage.setItem("user", JSON.stringify(json.user));
  return json.user;
}

// === USER SESSION ===
export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem("user");
}

// === SAVE TOKO ===
export async function saveToko(payload) {
  const res = await fetch(`${BASE}/save-toko`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// === GET SPK DATA ===
export async function getSpkData(cabang) {
  const res = await fetch(`${BASE}/spk-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cabang }),
  });
  return res.json();
}
