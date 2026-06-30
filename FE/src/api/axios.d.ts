import "axios";

// Axios interceptor đã unwrap res.data nên kiểu thực tế trả về là any
// Khai báo lại để TypeScript hiểu đúng
declare module "axios" {
  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>;
    (url: string, config?: AxiosRequestConfig): Promise<any>;
  }
}
