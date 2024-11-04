import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useLoginState } from "./useLoginState";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { setIsTokenRefreshing, processRequestQueue } from "./requestQueue";

// about renewal try state
let isTokenRenewalTry = false;

export const getTokenRenewalTryState = () => {
  return isTokenRenewalTry;
};

export const setTokenRenewalTryState = (state: boolean) => {
  isTokenRenewalTry = state;
};

const tokenQueryKey = "ACCESS_TOKEN";
export const accessTokenRenewPath = "auth/access-token";
export const refreshTokenRenewPath = "auth/refresh-tokens";

export enum TokenErrorMessage {
  ACCESS_TOKEN_EXPIRE = "Access token is expired",
  ACCESS_TOKEN_NO_PROVIDED = "No access token provided",
  REFRESH_TOKEN_EXPIRE = "Refresh token is expired",
}

// utils for token manage
export const getToken = (queryClient: QueryClient) => {
  return queryClient.getQueryData([tokenQueryKey]);
};

export const setToken = (queryClient: QueryClient, token: string) => {
  return queryClient.setQueryData([tokenQueryKey], token);
};

export const deleteToken = (queryClient: QueryClient) => {
  return queryClient.removeQueries({ queryKey: [tokenQueryKey] });
};

// React hook for token renewal
export const useTokenManager = () => {
  const queryClient = useQueryClient();
  const { setHttpErrorLogout } = useLoginState();

  // common logic
  const handleTokenError = (errorMessage: string) => {
    console.error(errorMessage);
    setHttpErrorLogout();
    setTokenRenewalTryState(false);
    setIsTokenRefreshing(false);
  };

  const renewToken = async (
    apiClient: AxiosInstance,
    originalRequest: AxiosRequestConfig,
    path: string
  ) => {
    try {
      // Tokne Refreshing State : TRUE
      setIsTokenRefreshing(true);

      const result = await apiClient.post(path);
      const newToken = result?.data?.accessToken;

      // 토큰 갱신 성공 시
      if (newToken) {
        // 1. 토큰 변경
        setToken(queryClient, newToken);
        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // 2. Request Queue에 보관했던 HTTP 요청 처리
        await processRequestQueue(apiClient, queryClient);

        // 3. 토큰 갱신 시도 여부 FALSE로 변경
        setTokenRenewalTryState(false);

        // 4. 토큰 만료로 처리되지 못한 기존 HTTP 요청 처리
        return await apiClient(originalRequest);
      }
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return handleTokenError(`Unknown error: ${error}`);
      }

      if (error.status === 401) {
        // when access token renewal fail
        if (
          path === accessTokenRenewPath &&
          error.response?.data?.message ===
            TokenErrorMessage.REFRESH_TOKEN_EXPIRE
        ) {
          console.warn(
            "Access token renewal failed. Attempting to renew with refresh token..."
          );
          return await renewToken(
            apiClient,
            originalRequest,
            refreshTokenRenewPath
          );
        }

        // when refresh token renewal fail
        return handleTokenError(`Error during refresh token renewal: ${error}`); // Refresh token 갱신 실패 시 에러 메시지 처리
      }
    }
  };

  // Export API
  const setRenewToken = async (
    errorMessage: string,
    apiClient: AxiosInstance,
    originalRequest: AxiosRequestConfig
  ) => {
    if (
      errorMessage === TokenErrorMessage.ACCESS_TOKEN_EXPIRE ||
      errorMessage === TokenErrorMessage.ACCESS_TOKEN_NO_PROVIDED
    ) {
      return await renewToken(apiClient, originalRequest, accessTokenRenewPath);
    }

    if (errorMessage === TokenErrorMessage.REFRESH_TOKEN_EXPIRE) {
      return await renewToken(
        apiClient,
        originalRequest,
        refreshTokenRenewPath
      );
    }

    // error ouccred except access/refresh token expired
    return handleTokenError(
      "An error about token occurred during HTTP network. Please log in again."
    );
  };

  return { setRenewToken, handleTokenError };
};
