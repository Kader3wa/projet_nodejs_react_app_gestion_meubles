import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import DataTable from "../components/DataTable";
import api from "../lib/Api";
import { useToast } from "../context/ToastContext";

export default function Companies() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({ id: null, name: "" });

  const load = async () => {
    const { data } = await api.get("/private/companies");
    setRows(data);
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft({ id: null, name: "" });
    setShow(true);
  };
  const openEdit = (r) => {
    setDraft({ id: r.id, name: r.name });
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (draft.id == null)
      await api.post("/private/companies", { name: draft.name });
    else await api.put(`/private/companies/${draft.id}`, { name: draft.name });
    setShow(false);
    toast("Enregistré");
    load();
  };
  const remove = async (id) => {
    if (!confirm("Supprimer ?")) return;
    await api.delete(`/private/companies/${id}`);
    toast("Supprimé");
    load();
  };

  const columns = [{ key: "name", label: "Nom" }];
  const enriched = rows.map((r) => ({
    ...r,
    actions: (
      <>
        <Button size="sm" variant="outline-primary" onClick={() => openEdit(r)}>
          Éditer
        </Button>{" "}
        <Button size="sm" variant="outline-danger" onClick={() => remove(r.id)}>
          Suppr.
        </Button>
      </>
    ),
  }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Entreprises</h2>
        <Button onClick={openCreate}>Nouveau</Button>
      </div>

      <DataTable columns={columns} rows={enriched} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>
              {draft.id ? "Modifier entreprise" : "Ajouter entreprise"}
            </Modal.Title>
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
