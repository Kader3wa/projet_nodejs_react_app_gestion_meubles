import { useEffect, useState } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";

export default function Tags() {
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);

  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({ id: null, label: "" });
  const [selectedMatIds, setSelectedMatIds] = useState([]);

  const [showModels, setShowModels] = useState(false);
  const [models, setModels] = useState([]);
  const [currentTag, setCurrentTag] = useState(null);

  const load = async () => {
    const [{ data }, { data: mats }] = await Promise.all([
      api.get("/private/tags"),
      api.get("/private/materials"),
    ]);
    setRows(
      data.map((t) => ({
        ...t,
        actions: (
          <>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => openModels(t)}
            >
              Voir modèles
            </Button>{" "}
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => openEdit(t)}
            >
              Éditer
            </Button>{" "}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => removeOne(t.id)}
            >
              Suppr.
            </Button>
          </>
        ),
      }))
    );
    setAllMaterials(mats);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft({ id: null, label: "" });
    setSelectedMatIds([]);
    setShow(true);
  };

  const openEdit = async (t) => {
    setDraft({ id: t.id, label: t.label });
    try {
      const { data: mats } = await api.get(`/private/tags/${t.id}/materials`);
      setSelectedMatIds(mats.map((m) => m.id));
    } catch {
      setSelectedMatIds([]);
    }
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const label = draft.label.trim();
    if (!label) return;

    if (draft.id == null) {
      await api.post("/private/tags", { label });
    } else {
      await api.put(`/private/tags/${draft.id}`, { label });
      await api.put(`/private/tags/${draft.id}/materials`, {
        material_ids: selectedMatIds,
      });
    }

    setShow(false);
    toast("Enregistré");
    load();
  };

  const removeOne = async (id) => {
    if (!confirm("Supprimer ce tag ?")) return;
    await api.delete(`/private/tags/${id}`);
    toast("Supprimé", "danger");
    load();
  };

  const openModels = async (t) => {
    setCurrentTag(t);
    const { data } = await api.get(`/private/tags/${t.id}/models`);
    setModels(data);
    setShowModels(true);
  };

  const columns = [{ key: "label", label: "Tag" }];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Tags</h2>
        <Button onClick={openCreate}>Nouveau tag</Button>
      </div>

      <DataTable columns={columns} rows={rows} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{draft.id ? "Modifier" : "Créer"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Libellé</Form.Label>
              <Form.Control
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                required
              />
            </Form.Group>

            {draft.id != null && (
              <Form.Group className="mb-3">
                <Form.Label>Matières liées</Form.Label>
                <Form.Select
                  multiple
                  value={selectedMatIds}
                  onChange={(e) => {
                    const ids = Array.from(e.target.selectedOptions).map((o) =>
                      Number(o.value)
                    );
                    setSelectedMatIds(ids);
                  }}
                >
                  {allMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.type}) — {m.company}
                    </option>
                  ))}
                </Form.Select>
                <div className="form-text">
                  Associe 1…n matières à ce mot-clé.
                </div>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModels} onHide={() => setShowModels(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modèles associés — {currentTag?.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Modèle</th>
                <th>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {models.length ? (
                models.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.category}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center text-muted">
                    Aucun modèle lié
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModels(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
