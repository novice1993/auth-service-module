import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import useService from "../useService/useService";
import { authStateAtom, AuthState } from "../atom/authStateAtom";
import { storageType, StorageType } from "../config";

const storage =
  storageType === StorageType.SESSION_STORAGE ? sessionStorage : localStorage;

const useAuth = (loginPagePath?: string, initPagePath?: string) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const { httpRequestGET, httpRequestPOST } = useService();
  const [authState, setAuthState] = useRecoilState(authStateAtom);
  const [loginStatusInfo, setLoginStatusInfo] = useState<{
    statusCode: number;
    statusText: string;
  }>();

  // 로그인 처리 후, 데이터 저장 및 전역 상태 변경
  const loginMutation = useMutation({
    mutationFn: async ({
      apiUrl,
      value,
    }: {
      apiUrl: string;
      value: object;
    }) => {
      const responseData = await httpRequestPOST(apiUrl, value);
      if (responseData.status === 200) {
        const result = await responseData?.json();
        return result;
      } else {
        setLoginStatusInfo({
          statusCode: responseData.status,
          statusText: responseData.statusText,
        });
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["loginInfo"], data);
        setAuthState(AuthState.LOGIN);
      }
    },
  });

  // 로그아웃 처리 후, 데이터 제거 및 전역 상태 변경
  const logoutMutation = useMutation({
    mutationFn: async ({
      apiUrl,
      authState,
    }: {
      apiUrl: string;
      authState: AuthState;
    }) => {
      try {
        const result = await httpRequestGET(apiUrl);
        if (result?.status == 200) {
          const jsonValue = await result.json();
          setAuthState(authState); // logout

          return jsonValue;
        } else {
          console.error("logoutToServer not 200!!");
        }
      } catch (error) {
        let message;
        if (error instanceof Error) message = error.message;
        else message = String(error);
        console.error("Error sending request:", message);
      }
    },
  });

  const setLogin = (apiUrl: string, value: object) => {
    loginMutation.mutate({ apiUrl, value });
  };

  const setLogout = (apiUrl: string, authState: AuthState) => {
    logoutMutation.mutate({ apiUrl, authState });
  };

  useEffect(() => {
    if (!initPagePath || !loginPagePath) return;

    if (authState === AuthState.LOGIN) {
      location.pathname === "/" && navigate(initPagePath);
      location.pathname === loginPagePath && navigate(initPagePath);
    } else {
      navigate(loginPagePath);

      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ["loginInfo"] });
        queryClient.removeQueries({ queryKey: ["tokenInfo"] });
      }, 400);

      setTimeout(() => {
        storage.removeItem("AUTH_STATE");
        storage.removeItem("AUTH_INFO");
        storage.removeItem("INIT_AUTH_INFO"); // 새로고침 혹은 브라우저 종료 대비용 auth 데이터
      }, 600);
    }
  }, [authState, location.pathname]);

  return { setLogin, setLogout, authState, loginStatusInfo };
};

export default useAuth;
