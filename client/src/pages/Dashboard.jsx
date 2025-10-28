import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getProtected } from "../lib/Api";

export default function Dashboard() {
  const { token, handleLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    getProtected(token)
      .then((data) => setUser(data.user))
      .catch((e) => setError(e.message));
  }, [token]);

  if (error)
    return (
      <div className="container py-5">
        <p style={{ color: "red" }}>Erreur : {error}</p>
        <button onClick={handleLogout}>Se reconnecter</button>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Tableau de bord</h1>
        <button className="btn btn-outline-secondary" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      {user ? (
        <div>
          <p>
            Bienvenue, <strong>{user.email}</strong>
          </p>
        </div>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
