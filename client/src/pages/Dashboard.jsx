import { useEffect, useState } from "react";
import api from "../lib/Api";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { handleLogout } = useAuth();
  const [me, setMe] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      try {
        const [{ data: protectedData }, { data: stats }] = await Promise.all([
          api.get("/protected", { signal: ctrl.signal }),
          api.get("/private/stats/global", { signal: ctrl.signal }),
        ]);
        setMe(protectedData.user);
        setKpi(stats);
      } catch (e) {
        if (e.name !== "CanceledError")
          setErr(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => ctrl.abort();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Chargement…</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex justify-content-between">
          <span>Erreur: {err}</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handleLogout}
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {me && (
        <p className="text-muted mb-4">
          Bienvenue, <strong>{me.email}</strong>
        </p>
      )}

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Modèles</div>
              <div className="h4 mb-0">{kpi?.models ?? 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Réalisations</div>
              <div className="h4 mb-0">{kpi?.builds ?? 0}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Matériaux</div>
              <div className="h4 mb-0">{kpi?.materials ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
