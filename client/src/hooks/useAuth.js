import { useState } from "react";
import { login } from "../lib/Api";

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return { token, handleLogin, handleLogout, isAuth: !!token };
}
