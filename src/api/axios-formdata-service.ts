import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getLoginStorage, removeLoginStorage } from "@/helpers/set-storage";

const URL = `${import.meta.env.VITE_APP_URL_API}`;

// --- สถาปัตยกรรมสำหรับ Multipart/Form-data ---
const axiosServiceFormdata: AxiosInstance = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

axiosServiceFormdata.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = getLoginStorage();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosServiceFormdata.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    const { response } = error;
    const responseUrl = response?.request?.responseURL || "";
    const isLogin = responseUrl.split("/").pop() === "login";

    const isUnauthorized = response?.status === 401 && !isLogin;

    if (isUnauthorized) {
      removeLoginStorage();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (response?.status === 500) {
      window.location.href = "/500";
    }

    return Promise.reject(response?.data || error);
  },
);

/**
 * Service Wrapper สำหรับ Form Data
 * D มักจะเป็น FormData หรือ Object ที่บรรจุ File
 */
export const serviceFormdata = () => {
  return {
    get: async <RES>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<RES> => {
      return await axiosServiceFormdata.get(url, config);
    },
    post: async <REQ = any, RES = any>(
      url: string,
      data: REQ | FormData,
      config?: AxiosRequestConfig,
    ): Promise<RES> => {
      return await axiosServiceFormdata.post(url, data, config);
    },
    put: async <REQ = any, RES = any>(
      url: string,
      data: REQ | FormData,
      config?: AxiosRequestConfig,
    ): Promise<RES> => {
      return await axiosServiceFormdata.put(url, data, config);
    },
    delete: async <REQ = any, RES = any>(
      url: string,
      payload?: REQ,
    ): Promise<RES> => {
      return await axiosServiceFormdata.delete(url, { data: payload });
    },
  };
};

export default serviceFormdata;
