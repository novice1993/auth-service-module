import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState, useSetRecoilState } from "recoil";
import useGetCachingData from "../aboutReactQuery/useGetCachingData";

import useService from "../useService/useService";
import useAuth from "../useAuth/useAuth";
import useAuthExpireTime from "./useAuthExpireTime";

import { selectNecessaryData } from "../util/selectNecessaryData";
import { TargetObjectType } from "../util/selectNecessaryData";
import { authAtom, AuthState } from "../atom/authStateAtom";
import { authTypeAtom } from "../atom/authTypeAtom";
import { AuthManagerProps } from "../type/type";
import { storageType, StorageType } from "../config";

const storage =
  storageType === StorageType.SESSION_STORAGE ? sessionStorage : localStorage;

const useAuthManager = (props: AuthManagerProps) => {
  const {
    authType,
    isRenew,
    authEndTime,
    keyName,
    serverUrl,
    clientRoutePath,
  } = props;

  const queryClient = useQueryClient();
  const { httpRequestForAuthRenew } = useService();

  const setAuthType = useSetRecoilState(authTypeAtom);
  const [loginState, setLoginState] = useRecoilState(authAtom);
  const loginInfo = useGetCachingData({ queryKey: ["loginInfo"] }).data;

  useAuth(clientRoutePath.loginPagePath, clientRoutePath.initPagePath);
  useAuthExpireTime(
    loginInfo,
    authEndTime,
    keyName,
    clientRoutePath.loginPagePath
  );

  const setInitAuth = () => {
    const authInfo = selectNecessaryData(
      loginInfo as TargetObjectType,
      keyName
    );
    return authInfo;
  };

  const setAuthRenew = async () => {
    if (!isRenew) return;

    try {
      const result = await httpRequestForAuthRenew(serverUrl.authRenewUrl);

      if (result?.status === 200) {
        const data = await result?.json();
        const authInfo = selectNecessaryData(data, keyName);

        queryClient.setQueryData(["tokenInfo"], authInfo);
        const cachingData = queryClient.getQueryData(["tokenInfo"]);
        storage.setItem("INIT_AUTH_INFO", JSON.stringify(cachingData));

        return cachingData;
      } else {
        console.log("[TKR] checkToken, fail", result.statusText);
        setLoginState(AuthState.HTTP_ERROR_LOGOUT);
      }
    } catch (error) {
      console.log("[TKR] checkToken, error", error);
      setLoginState(AuthState.HTTP_ERROR_LOGOUT);
    }
  };

  const setAuthQueryFn = async () => {
    if (!keyName) return;

    const tokenInfo = queryClient.getQueryData(["tokenInfo"]) as {
      token?: string;
    };
    const authInfo = tokenInfo?.token ? await setAuthRenew() : setInitAuth(); // token 값 존재 유무에 따라 init Auth, renew Auth 결정

    return authInfo;
  };

  useEffect(() => {
    if (authType) setAuthType(authType);
  }, []);

  useQuery({
    initialData: () => {
      const initAuthInfo = storage.getItem("INIT_AUTH_INFO"); // 로컬 스토리지에 저장된 데이터가 있을 경우 초기값 적용

      if (initAuthInfo) {
        return JSON.parse(initAuthInfo);
      } else {
        return undefined;
      }
    },
    queryKey: authType === "jwtToken" ? ["tokenInfo"] : ["cookieInfo"],
    queryFn: setAuthQueryFn,
    enabled: loginState === AuthState.LOGIN && isRenew, // 로그인 상태일 때 동작
    refetchInterval: isRenew && props.renewInterval,
    notifyOnChangeProps: [],
  });
};

export default useAuthManager;
