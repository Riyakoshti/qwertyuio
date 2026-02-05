import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    console.log(error.config)
    const originalRequest = error.config;
    console.log(originalRequest.url)

    // 🚫 Do not retry refresh endpoint itself
    if (originalRequest.url?.includes("/refresh")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    if (
      (error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post("/refresh/");

        // store new token
        localStorage.setItem("access_token", res.data.access_token);

        // attach new token
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return api(originalRequest);
      } catch (err) {
        // refresh failed → force logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;