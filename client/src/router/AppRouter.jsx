import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AdminLayout from "../layout/AdminLayout";
import Companies from "../pages/Companies";
import Materials from "../pages/Materials";

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="materials" element={<Materials />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
