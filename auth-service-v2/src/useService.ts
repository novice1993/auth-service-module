import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useHttpErrorHandler } from "./useHttpErrorHandler";
import { handleHttpRequest } from "./requestQueue";

interface HttpRequestReturnType<T> {
  result?: AxiosResponse<T>;
  abortController: AbortController;
}

const serverUrl = import.meta.env.VITE_SERVER_URL;

const useService = () => {
  const queryClient = useQueryClient();

  // Axios Instance
  const apiClient: AxiosInstance = axios.create({
    baseURL: serverUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // Set HTTP Error Handler in Axios Instance
  const { httpErrorHandler } = useHttpErrorHandler(apiClient);

  apiClient.interceptors.request.use(async (config) => {
    return await handleHttpRequest(config, queryClient);
  });

  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      return httpErrorHandler(error);
    }
  );

  // Common HTTP Request Logic
  const httpRequest = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const abortController = new AbortController();

    try {
      const result = await apiClient.request<T>({
        method,
        url: path,
        data,
        signal: abortController.signal,
        ...config,
      });

      return { result, abortController };
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn(`Request to ${path} was cancelled.`);
      } else {
        console.error(`HTTP Request failed after retries: ${error}`);
      }

      return { abortController };
    }
  };

  // Exports API
  const httpRequestGET = async <T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const { result, abortController } = await httpRequest<T>(
      "GET",
      path,
      undefined,
      { headers: { "Content-Type": "text/plain" }, ...config }
    );
    return { result, abortController };
  };

  const httpRequestFORM = async <T>(
    path: string,
    data?: FormData,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const { result, abortController } = await httpRequest<T>(
      "POST",
      path,
      data,
      { headers: { "Content-Type": "multipart/form-data" }, ...config }
    );
    return { result, abortController };
  };

  const httpRequestPOST = async <T>(
    path: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const { result, abortController } = await httpRequest<T>(
      "POST",
      path,
      data,
      config
    );
    return { result, abortController };
  };

  const httpRequestPUT = async <T>(
    path: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const { result, abortController } = await httpRequest<T>(
      "PUT",
      path,
      data,
      config
    );
    return { result, abortController };
  };

  const httpRequestDELETE = async <T>(
    path: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<HttpRequestReturnType<T>> => {
    const { result, abortController } = await httpRequest<T>(
      "DELETE",
      path,
      data,
      config
    );
    return { result, abortController };
  };

  return {
    httpRequestGET,
    httpRequestPOST,
    httpRequestPUT,
    httpRequestFORM,
    httpRequestDELETE,
  };
};

export default useService;
