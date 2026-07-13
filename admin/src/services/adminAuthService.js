import api from "./api";

export const adminLogin = async (credentials) => {
  const response = await api.post("/admin/auth/login", credentials);

  if (response.data.token) {
    localStorage.setItem("admin_token", response.data.token);
  }

  return response.data;
};

export const adminLogout = () => {
  localStorage.removeItem("admin_token");
};

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem("admin_token");
};