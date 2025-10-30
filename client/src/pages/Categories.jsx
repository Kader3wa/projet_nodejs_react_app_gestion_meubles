import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";
import { PlusCircle } from "react-bootstrap-icons";

export default function Categories() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({ id: null, name: "" });

  const load = async () => {
    const { data } = await api.get("/private/categories");
    setRows(
      data.map((r) => ({
        ...r,
        actions: (
          <>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => openEdit(r)}
            >
              Éditer
            </Button>{" "}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => removeOne(r.id)}
            >
              Suppr.
            </Button>
          </>
        ),
      }))
    );
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
      await api.post("/private/categories", { name: draft.name.trim() });
    else
      await api.put(`/private/categories/${draft.id}`, {
        name: draft.name.trim(),
      });
    setShow(false);
    toast("Enregistré");
    load();
  };

  const removeOne = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await api.delete(`/private/categories/${id}`);
    toast("Supprimé", "danger");
    load();
  };

  const columns = [{ key: "name", label: "Nom" }];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Catégories</h2>
        <Button onClick={openCreate}>
          <PlusCircle className="mb-1 me-2" />
          Ajouter
        </Button>
      </div>

      <DataTable columns={columns} rows={rows} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>
              {draft.id ? "Modifier cette catégorie" : "Ajouter une catégorie"}
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
