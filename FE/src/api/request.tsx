import axios, { type AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_URL || "http://localhost:3000/api",
});

// Transform mọi request trước khi gọi lên server
// Lấy token trong localStorage và đính vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token ? token : "";
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// Transform mọi response trả về => unwrap res.data
// Nên kiểu thực tế trả về là dữ liệu từ server, không phải AxiosResponse
axiosInstance.interceptors.response.use(
  (res) => {
    if (res && res.data) {
      return res.data;
    }
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// Cast về Promise<any> vì interceptor đã unwrap res.data
// TypeScript không tự suy ra được điều này từ AxiosInstance
function request(config: AxiosRequestConfig): Promise<any> {
  return axiosInstance(config) as unknown as Promise<any>;
}

export default request;
