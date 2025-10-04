import axios from "axios";
import { toast } from "react-hot-toast";

const apiReq = axios.create({
  baseURL: "https://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiReq.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// apiReq.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       localStorage.removeItem("token");

//       const currentPath = window.location.pathname + window.location.search;

//       if (currentPath !== "/login") {
//         const errorMessage =
//           error.response?.data?.message ||
//           "Session expired. Please login again.";
//         toast.error(errorMessage);

//         sessionStorage.setItem("preAuthPath", currentPath);

//         setTimeout(() => {
//           window.location.href = `/login?from=${encodeURIComponent(
//             currentPath
//           )}`;
//         }, 1500);
//       }

//       return Promise.reject(error);
//     }

//     const errorMessage =
//       error.response?.data?.message || error.message || "An error occurred";
//     if (!originalRequest._retry) {
//       toast.error(errorMessage);
//     }

//     return Promise.reject(error);
//   }
// );

export default apiReq;