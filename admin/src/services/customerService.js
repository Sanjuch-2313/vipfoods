import api from "./api";

// Get all customers
export const getCustomers = async (params = {}) => {
  const response = await api.get("/customers", {
    params,
  });

  return response.data;
};

// Get single customer
export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);

  return response.data.customer;
};

// Create customer
export const createCustomer = async (data) => {
  const response = await api.post("/customers", data);

  return response.data;
};

// Update customer
export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);

  return response.data;
};

// Delete customer
export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);

  return response.data;
};