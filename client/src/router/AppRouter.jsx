import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AdminLayout from "../layout/AdminLayout";
import Companies from "../pages/Companies";
import Materials from "../pages/Materials";
import Categories from "../pages/Categories";
import FurnitureModels from "../pages/FurnitureModels";
import Builds from "../pages/Builds";

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
          <Route path="categories" element={<Categories />} />
          <Route path="furniture-models" element={<FurnitureModels />} />
          <Route path="builds" element={<Builds />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
