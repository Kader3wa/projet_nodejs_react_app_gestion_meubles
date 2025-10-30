import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Compass, House, Lock, WindowDesktop } from "react-bootstrap-icons";

export default function AdminLayout() {
  const { handleLogout } = useAuth();

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <WindowDesktop className="mb-1 me-2" />
            Gestion Meubles
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              <House className="mb-1 me-2" />
              Tableau de bord
            </Nav.Link>
            <Nav.Link as={Link} to="/companies">
              <Compass className="mb-1 me-2" />
              Entreprises
            </Nav.Link>
            <Nav.Link onClick={handleLogout}>
              <Lock className="mb-1 me-2" />
              Déconnexion
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
