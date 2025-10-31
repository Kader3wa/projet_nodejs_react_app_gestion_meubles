import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";

export default function FurnitureModels() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    id: null,
    name: "",
    description: "",
    category_id: "",
  });

  const load = async () => {
    const [{ data: models }, { data: categories }] = await Promise.all([
      api.get("/private/furniture_models"),
      api.get("/private/categories"),
    ]);
    setRows(
      models.map((m) => ({
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
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft({ id: null, name: "", description: "", category_id: "" });
    setShow(true);
  };
  const openEdit = (m) => {
    setDraft({
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      category_id: m.category_id,
    });
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
    if (draft.id == null) await api.post("/private/furniture_models", payload);
    else await api.put(`/private/furniture_models/${draft.id}`, payload);
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

  const columns = [
    { key: "name", label: "Nom" },
    { key: "category_name", label: "Catégorie" },
    { key: "builds_count", label: "Réalisations" },
  ];

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
