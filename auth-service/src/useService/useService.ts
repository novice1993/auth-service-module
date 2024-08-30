/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilState, useRecoilValue } from "recoil";
import { useQueryClient } from "@tanstack/react-query";
import { authStateAtom, AuthState } from "../atom/authStateAtom";
import { AuthType, authTypeAtom } from "../atom/authTypeAtom";
import { serverUrl } from "../config";

const retryTimeout = 100;

const makeTimoutRequest = () => {
  return new Promise((resolve) => setTimeout(resolve, retryTimeout));
};

const useService = () => {
  const queryClient = useQueryClient();

  const authType = useRecoilValue(authTypeAtom);
  const [authState, setAuthState] = useRecoilState(authStateAtom);

  const checkRequest = () => {
    if (authState !== AuthState.LOGIN || authType !== AuthType.JWT_TOKEN) {
      return true;
    } else {
      const tokenInfo = queryClient.getQueryData(["tokenInfo"]) as {
        token: string;
      };
      const isAuthFetching = queryClient.isFetching({
        queryKey: ["tokenInfo"],
      });

      if (!tokenInfo || tokenInfo?.token === "" || isAuthFetching) {
        return false;
      } else {
        return true;
      }
    }
  };

  const getHeader = (contentType?: string) => {
    const tokenInfo = queryClient.getQueryData(["tokenInfo"]) as {
      token: string;
    };

    const header: Record<string, string> = {
      "Content-Type": contentType ?? "text/plain",
    };

    if (tokenInfo?.token) {
      header.Authorization = `Bearer ${tokenInfo.token}`;
    }

    return header;
  };

  //공통 에러 처리
  const resCommonError = (status: number | undefined) => {
    if (status === 612) {
      return setAuthState(AuthState.HTTP_ERROR_LOGOUT); // 612 Error 발생 시, 로그아웃 처리
    }
  };

  const _httpRequest = async (type: string, url: string) => {
    try {
      const headers = getHeader();
      const response = await fetch(url, {
        method: type,
        headers: headers,
      });

      resCommonError(response?.status);
      return response;
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.error("[SVC] Error sending request:", message);
    }
  };

  const _httpRequestWithParams = async (
    type: string,
    url: string,
    body: string | FormData,
    isForm?: boolean
  ) => {
    try {
      const contentType =
        isForm == true ? "multipart/form-data" : "application/json";
      const headers = getHeader(contentType);

      const response = await fetch(url, {
        method: type,
        headers: headers,
        body: body,
      });
      resCommonError(response?.status);
      return response;
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      console.error("[SVC] Error sending request:", message);
    }
  };

  const httpRequestGET = async (path: string): Promise<any> => {
    if (checkRequest() === false) {
      await makeTimoutRequest();
      return httpRequestGET(path);
    } else {
      const url = serverUrl + path;
      const result = await _httpRequest("GET", url);
      return result;
    }
  };

  const httpRequestFORM = async (
    path: string,
    data: FormData
  ): Promise<any> => {
    if (checkRequest() === false) {
      await makeTimoutRequest();
      return httpRequestFORM(path, data);
    } else {
      const url = serverUrl + path;
      const result = await _httpRequestWithParams("POST", url, data, true);
      return result;
    }
  };

  const httpRequestPOST = async (path: string, param: object): Promise<any> => {
    if (checkRequest() === false) {
      await makeTimoutRequest();
      return httpRequestPOST(path, param);
    } else {
      const url = serverUrl + path;
      const body = JSON.stringify({ ...param });
      const result = await _httpRequestWithParams("POST", url, body);
      return result;
    }
  };

  const httpRequestPUT = async (path: string, param: object): Promise<any> => {
    if (checkRequest() === false) {
      await makeTimoutRequest();
      return httpRequestPUT(path, param);
    } else {
      const url = serverUrl + path;
      const body = JSON.stringify({ ...param });
      const result = await _httpRequestWithParams("PUT", url, body);
      return result;
    }
  };

  const httpRequestDELETE = async (path: string): Promise<any> => {
    if (checkRequest() === false) {
      await makeTimoutRequest();
      return httpRequestDELETE(path);
    } else {
      const url = serverUrl + path;
      const result = await _httpRequest("DELETE", url);
      return result;
    }
  };

  // auth renew 전용 API
  const httpRequestForAuthRenew = async (path: string): Promise<any> => {
    const url = serverUrl + path;
    const result = await _httpRequest("GET", url);
    return result;
  };

  return {
    httpRequestGET,
    httpRequestPOST,
    httpRequestPUT,
    httpRequestFORM,
    httpRequestDELETE,
    httpRequestForAuthRenew,
  };
};

export default useService;
