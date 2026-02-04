import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_URL || "http://localhost:3000/api",
});

//Tranform mọi resquest trước khi gọi lên server
//lấy token trong localStorage
//đính vào header
instance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    const token = localStorage.getItem("token");
    config.headers.Authorization = token ? token : "";
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

//TRANFORM mọi respone trả về => bỏ qua lớp data của axios
//+ fetch res => chính là kết quả trả về
//+ axios res.data => chính là kết quả trả về
instance.interceptors.response.use(
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

export default instance;
