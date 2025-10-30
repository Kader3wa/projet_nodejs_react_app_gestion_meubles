import { useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";

const TYPES = ["Bois", "Fer", "Plastique"];

export default function Materials() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    id: null,
    name: "",
    type: "Bois",
    company_id: "",
  });

  const load = async () => {
    const [{ data: mats }, { data: comps }] = await Promise.all([
      api.get("/private/materials"),
      api.get("/private/companies"),
    ]);
    setRows(
      mats.map((m) => ({
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
    setCompanies(comps);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft({ id: null, name: "", type: "Bois", company_id: "" });
    setShow(true);
  };

  const openEdit = (r) => {
    setDraft({
      id: r.id,
      name: r.name,
      type: r.type,
      company_id:
        companies.find((c) => c.name === r.company)?.id ?? r.company_id ?? "",
    });
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (!draft.company_id) return;

    const payload = {
      name: draft.name.trim(),
      type: draft.type,
      company_id: Number(draft.company_id),
    };

    if (draft.id == null) {
      await api.post("/private/materials", payload);
      toast("Matériau créé");
    } else {
      await api.put(`/private/materials/${draft.id}`, payload);
      toast("Matériau mis à jour");
    }
    setShow(false);
    load();
  };

  const removeOne = async (id) => {
    if (!confirm("Supprimer ce matériau ?")) return;
    await api.delete(`/private/materials/${id}`);
    toast("Supprimé", "danger");
    load();
  };

  const columns = [
    { key: "name", label: "Nom" },
    { key: "type", label: "Type" },
    { key: "company", label: "Entreprise" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Matériaux</h2>
        <Button onClick={openCreate}>Nouveau</Button>
      </div>

      <DataTable columns={columns} rows={rows} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{draft.id ? "Modifier" : "Créer"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft({ ...draft, type: e.target.value })
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Entreprise</Form.Label>
                  <Form.Select
                    value={draft.company_id}
                    onChange={(e) =>
                      setDraft({ ...draft, company_id: e.target.value })
                    }
                    required
                  >
                    <option value="">— choisir —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
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
