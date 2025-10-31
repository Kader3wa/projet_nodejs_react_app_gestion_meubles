import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form, Row, Col, Table } from "react-bootstrap";
import api from "../lib/Api";
import DataTable from "../components/DataTable";
import { useToast } from "../context/ToastContext";

export default function Builds() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [models, setModels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    id: null,
    furniture_model_id: "",
    ref: "",
    date_creation: "",
    destination: "",
    notes: "",
  });

  // Matériaux de la réalisation sélectionnée (dans la modale)
  const [bm, setBm] = useState([]); // build_materials courants
  const [bmDraft, setBmDraft] = useState({
    material_id: "",
    quantity: "",
    unit: "u",
    cost_unit: "",
  });

  const load = async () => {
    const [{ data: builds }, { data: models }, { data: mats }] =
      await Promise.all([
        api.get("/private/builds"),
        api.get("/private/furniture_models"),
        api.get("/private/materials"),
      ]);
    setRows(
      builds.map((b) => ({
        ...b,
        actions: (
          <>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => openEdit(b)}
            >
              Éditer
            </Button>{" "}
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => removeOne(b.id)}
            >
              Suppr.
            </Button>
          </>
        ),
      }))
    );
    setModels(models);
    setMaterials(mats);
  };

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(
    () => [
      { key: "ref", label: "Réf." },
      { key: "date_creation", label: "Date" },
      { key: "model_name", label: "Modèle" },
      { key: "destination", label: "Destination" },
    ],
    []
  );

  const openCreate = () => {
    setDraft({
      id: null,
      furniture_model_id: "",
      ref: "",
      date_creation: "",
      destination: "",
      notes: "",
    });
    setBm([]); // pas de matériaux pour une création
    setShow(true);
  };

  const openEdit = async (b) => {
    // charger détail + matériaux
    const { data } = await api.get(`/private/builds/${b.id}`);
    setDraft({
      id: data.id,
      furniture_model_id: data.furniture_model_id,
      ref: data.ref || "",
      date_creation: data.date_creation || "",
      destination: data.destination || "",
      notes: data.notes || "",
    });
    setBm(data.materials || []);
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!draft.furniture_model_id) return;
    const payload = {
      furniture_model_id: Number(draft.furniture_model_id),
      ref: draft.ref || null,
      date_creation: draft.date_creation || null,
      destination: draft.destination || null,
      notes: draft.notes || null,
    };
    if (draft.id == null) {
      await api.post("/private/builds", payload);
      toast("Réalisation créée");
    } else {
      await api.put(`/private/builds/${draft.id}`, payload);
      toast("Réalisation mise à jour");
    }
    setShow(false);
    load();
  };

  const removeOne = async (id) => {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await api.delete(`/private/builds/${id}`);
    toast("Supprimé", "danger");
    load();
  };

  // --- Gestion des matériaux consommés (dans la modale) ---
  const addMaterial = async (e) => {
    e.preventDefault();
    if (!draft.id) return; // sécurité: on ne gère les matières qu’en édition
    if (!bmDraft.material_id) return;
    const payload = {
      material_id: Number(bmDraft.material_id),
      quantity: bmDraft.quantity === "" ? 0 : Number(bmDraft.quantity),
      unit: bmDraft.unit || "u",
      cost_unit: bmDraft.cost_unit === "" ? 0 : Number(bmDraft.cost_unit),
    };
    await api.post(`/private/builds/${draft.id}/materials`, payload);
    toast("Matière ajoutée / mise à jour");
    // refresh section matériaux
    const { data } = await api.get(`/private/builds/${draft.id}`);
    setBm(data.materials || []);
    setBmDraft({ material_id: "", quantity: "", unit: "u", cost_unit: "" });
  };

  const editBm = (m) => {
    setBmDraft({
      material_id: m.id,
      quantity: m.quantity ?? "",
      unit: m.unit || "u",
      cost_unit: m.cost_unit ?? "",
    });
  };

  const removeBm = async (material_id) => {
    if (!confirm("Retirer ce matériau de la réalisation ?")) return;
    await api.delete(`/private/builds/${draft.id}/materials/${material_id}`);
    toast("Matière retirée", "danger");
    const { data } = await api.get(`/private/builds/${draft.id}`);
    setBm(data.materials || []);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Réalisations</h2>
        <Button onClick={openCreate}>Nouvelle réalisation</Button>
      </div>

      <DataTable columns={columns} rows={rows} pageSize={10} />

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>
              {draft.id ? "Modifier la réalisation" : "Créer une réalisation"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Modèle</Form.Label>
                  <Form.Select
                    value={draft.furniture_model_id}
                    onChange={(e) =>
                      setDraft({ ...draft, furniture_model_id: e.target.value })
                    }
                    required
                  >
                    <option value="">— choisir —</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.category_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Référence</Form.Label>
                  <Form.Control
                    value={draft.ref}
                    onChange={(e) =>
                      setDraft({ ...draft, ref: e.target.value })
                    }
                    placeholder="ex: CMD-001"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={draft.date_creation || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, date_creation: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    value={draft.destination}
                    onChange={(e) =>
                      setDraft({ ...draft, destination: e.target.value })
                    }
                    placeholder="Client / Magasin / Stock"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={draft.notes}
                    onChange={(e) =>
                      setDraft({ ...draft, notes: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Section Matériaux consommés : visible seulement en édition */}
            {draft.id && (
              <div className="mt-4">
                <h6 className="mb-2">Matériaux consommés</h6>
                <Table bordered hover size="sm" className="mb-2">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                      <th>Coût unitaire</th>
                      <th style={{ width: 140 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bm.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{m.type}</td>
                        <td>{m.quantity}</td>
                        <td>{m.unit}</td>
                        <td>{m.cost_unit}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => editBm(m)}
                          >
                            Éditer
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeBm(m.id)}
                          >
                            Retirer
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {bm.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">
                          Aucun matériau associé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Formulaire d’ajout / édition matière */}
                <Form onSubmit={addMaterial}>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Select
                        value={bmDraft.material_id}
                        onChange={(e) =>
                          setBmDraft({
                            ...bmDraft,
                            material_id: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">— matière —</option>
                        {materials.map((mat) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} ({mat.type}) — {mat.company}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Qté"
                        value={bmDraft.quantity}
                        onChange={(e) =>
                          setBmDraft({ ...bmDraft, quantity: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Select
                        value={bmDraft.unit}
                        onChange={(e) =>
                          setBmDraft({ ...bmDraft, unit: e.target.value })
                        }
                      >
                        <option value="u">u</option>
                        <option value="m">m</option>
                        <option value="m2">m²</option>
                        <option value="kg">kg</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="€/u"
                        value={bmDraft.cost_unit}
                        onChange={(e) =>
                          setBmDraft({ ...bmDraft, cost_unit: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={2} className="d-grid">
                      <Button type="submit">
                        {bmDraft.material_id ? "Ajouter / MAJ" : "Ajouter"}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Fermer
            </Button>
            <Button type="submit">Enregistrer</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
