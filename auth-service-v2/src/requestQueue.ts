import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { refreshTokenRenewPath } from "./useTokenManager";
import { getToken } from "./useTokenManager";
import { QueryClient } from "@tanstack/react-query";

// 토큰 갱신 상태 여부
let isTokenRefreshing = false;

export const getIsTokenRefreshing = () => isTokenRefreshing;

export const setIsTokenRefreshing = (refreshingState: boolean) => {
  isTokenRefreshing = refreshingState;
};

// 토큰 갱신 시, 발생한 HTTP 요청을 임시로 보관하는 배열
const requestQueue: Array<InternalAxiosRequestConfig> = [];

const getRequestQueue = () => {
  return requestQueue;
};

const addRequestToQueue = (
  request: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  const isDuplicateRequest = requestQueue.some(
    (queuedRequest) =>
      queuedRequest.url === request.url &&
      queuedRequest.method === request.method
  );

  return new Promise<InternalAxiosRequestConfig>((resolve) => {
    if (!isDuplicateRequest) {
      requestQueue.push(request);
      console.log("Request added to queue:", request);
    } else {
      console.log("Duplicate request, not added to queue:", request);
    }
    resolve(request);
  });
};

const resetRequestQueue = () => {
  requestQueue.length = 0;
};

/**
 * 토큰 갱신 상태일 때는 HTTP 요청을 Request Queue에 보관하고, 아닐 시 바로 HTTP Request 발생
 */
export const handleHttpRequest = (
  config: InternalAxiosRequestConfig,
  queryClient: QueryClient
) => {
  const isTokenRefreshing = getIsTokenRefreshing();
  const isTokenRenewRequest = config.url === refreshTokenRenewPath;
  const token = getToken(queryClient);

  if (isTokenRefreshing && !isTokenRenewRequest) {
    return addRequestToQueue(config);
  }

  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
};

/**
 * 토큰 갱신 완료 시, 임시로 보관했던 HTTP 요청 Request 수행
 */
export const processRequestQueue = async (
  apiClient: AxiosInstance,
  queryClient: QueryClient
) => {
  const requestQueue = getRequestQueue();
  const newToken = getToken(queryClient);

  requestQueue.forEach(async (request: InternalAxiosRequestConfig) => {
    if (newToken && request.headers) {
      request.headers["Authorization"] = `Bearer ${newToken}`;
    }

    await apiClient(request);
  });

  resetRequestQueue();
  setIsTokenRefreshing(false);
};
