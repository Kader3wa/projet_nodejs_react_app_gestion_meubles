import { useState } from "react";
import api from "../lib/Api";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return { token, isAuth: !!token, handleLogin, handleLogout };
}
