import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";

export default function FurnitureModels() {
  const toast = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    id: null,
    name: "",
    description: "",
    category_id: "",
  });
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const load = async () => {
    const [{ data: models }, { data: categories }, { data: tags }] =
      await Promise.all([
        api.get("/private/furniture_models"),
        api.get("/private/categories"),
        api.get("/private/tags"),
      ]);

    const withTags = await Promise.all(
      models.map(async (m) => {
        try {
          const { data: t } = await api.get(
            `/private/furniture_models/${m.id}/tags`
          );
          return { ...m, tags: t };
        } catch {
          return { ...m, tags: [] };
        }
      })
    );

    setRows(
      withTags.map((m) => ({
        ...m,
        actions: (
          <>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => openEdit(m)}
            >
              Éditer
            </Button>{" "}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => removeOne(m.id)}
            >
              Suppr.
            </Button>
          </>
        ),
      }))
    );
    setCats(categories);
    setAllTags(tags);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft({ id: null, name: "", description: "", category_id: "" });
    setSelectedTagIds([]);
    setShow(true);
  };

  const openEdit = async (m) => {
    setDraft({
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      category_id: m.category_id,
    });

    try {
      const { data } = await api.get(`/private/furniture_models/${m.id}/tags`);
      setSelectedTagIds(data.map((t) => t.id));
    } catch {
      setSelectedTagIds([]);
    }
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.category_id) return;

    const payload = {
      name: draft.name.trim(),
      description: draft.description || null,
      category_id: Number(draft.category_id),
    };

    let id = draft.id;
    if (id == null) {
      const { data } = await api.post("/private/furniture_models", payload);
      id = data.id;
    } else {
      await api.put(`/private/furniture_models/${id}`, payload);
    }

    if (id != null) {
      await api.put(`/private/furniture_models/${id}/tags`, {
        tag_ids: selectedTagIds,
      });
    }

    setShow(false);
    toast("Enregistré");
    load();
  };

  const removeOne = async (id) => {
    if (!confirm("Supprimer ce modèle ?")) return;
    await api.delete(`/private/furniture_models/${id}`);
    toast("Supprimé", "danger");
    load();
  };

  const columns = useMemo(
    () => [
      { key: "name", label: "Nom" },
      { key: "category_name", label: "Catégorie" },
      { key: "builds_count", label: "Réalisations" },
      {
        key: "tags",
        label: "Tags",
        render: (_v, r) => (
          <span>
            {(r.tags || []).map((t) => (
              <span
                key={t.id}
                className="badge rounded-pill text-bg-secondary me-1"
                role="button"
                onClick={async () => {
                  try {
                    const { data: mats } = await api.get(
                      `/private/tags/${t.id}/materials`
                    );
                    if (mats.length === 1)
                      return navigate(`/materials/${mats[0].id}`);
                    if (mats.length === 0)
                      return toast(
                        "Ce tag n'est lié à aucune matière",
                        "warning"
                      );
                    navigate(`/materials/${mats[0].id}`);
                  } catch {
                    toast("Impossible d'ouvrir la matière", "danger");
                  }
                }}
              >
                {t.label}
              </span>
            ))}
          </span>
        ),
      },
    ],
    [navigate, toast]
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Modèles</h2>
        <Button onClick={openCreate}>Nouveau modèle</Button>
      </div>

      <DataTable columns={columns} rows={rows} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{draft.id ? "Modifier" : "Créer"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Catégorie</Form.Label>
              <Form.Select
                value={draft.category_id}
                onChange={(e) =>
                  setDraft({ ...draft, category_id: e.target.value })
                }
                required
              >
                <option value="">— choisir —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (mots-clés)</Form.Label>
              <Form.Select
                multiple
                value={selectedTagIds}
                onChange={(e) => {
                  const ids = Array.from(e.target.selectedOptions).map((o) =>
                    Number(o.value)
                  );
                  setSelectedTagIds(ids);
                }}
              >
                {allTags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
              <div className="form-text">
                Associe 1…n tags au modèle (les tags sont liés à des matières).
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
