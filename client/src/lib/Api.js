const API = "/api";

export async function login(email, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("Erreur d'authentification");
  return r.json();
}

export async function getProtected(token) {
  const r = await fetch(`${API}/protected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Accès refusé");
  return r.json();
}
