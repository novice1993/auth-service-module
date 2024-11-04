import axiosRetry from "axios-retry";
import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useTokenManager } from "./useTokenManager";

import {
  getTokenRenewalTryState,
  setTokenRenewalTryState,
} from "./useTokenManager";

export const useHttpErrorHandler = (apiClient: AxiosInstance) => {
  const { setRenewToken } = useTokenManager();

  // except 401 Error
  axiosRetry(apiClient, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => error.response?.status !== 401,
    onRetry(retryCount, error, requestConfig) {
      console.warn(`Retry attempt #${retryCount} for ${requestConfig.url}`, {
        message: error.message,
        status: error.response?.status,
        url: requestConfig.url,
      });
    },
  });

  // about 401 Error
  const handleTokenExpire = async (
    errorMessage: string,
    originalRequest: AxiosRequestConfig
  ) => {
    return await setRenewToken(errorMessage, apiClient, originalRequest);
  };

  // HTTP Error Handler
  const httpErrorHandler = async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;
    const statusCode = error.response?.status;
    const errorMessage = (error?.response?.data as { message: string })
      ?.message;

    // Token 갱신 요청을 수행했는지 여부 -> 토큰 갱신 관련 네트워크 무한요청 방지
    const isTokenRenewalTry = getTokenRenewalTryState();

    if (statusCode === 401 && !isTokenRenewalTry) {
      setTokenRenewalTryState(true);
      return await handleTokenExpire(errorMessage, originalRequest);
    }

    throw error;
  };

  return { httpErrorHandler };
};
