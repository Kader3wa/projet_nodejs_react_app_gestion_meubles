export async function apiHello() {
  const r = await fetch("/api");
  if (!r.ok) throw new Error("API error");
  return r.json();
}
