import { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { BoxArrowInRight, EnvelopeOpen, Lock } from "react-bootstrap-icons"; // icône login
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
      navigate("/");
    } catch {
      setError("Identifiants invalides");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light vh-100"
      style={{ minHeight: "100vh" }}
    >
      <Container style={{ maxWidth: "420px" }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <BoxArrowInRight size={40} className="text-primary mb-2" />
              <h3 className="fw-bold">Espace Membre</h3>
              <p className="text-muted small mb-0">Gestion Meubles</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <EnvelopeOpen className="me-2" />
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: demo@meubles.fr"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <Lock className="me-2" />
                  Mot de passe
                </Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 py-2">
                <BoxArrowInRight className="me-2" />
                Se connecter
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
