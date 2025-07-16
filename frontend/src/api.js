// api.js
const API = import.meta.env.VITE_API_URL;

export const apiFetch = (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  return fetch(`${API}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: isFormData
      ? options.headers 
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
  });
};
