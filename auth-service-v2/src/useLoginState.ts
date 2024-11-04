import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { deleteToken } from "./useTokenManager";
import { loginStateAtom } from "../atom/auth";

export enum LoginState {
  LOGIN = "login",
  NORMAL_LOGOUT = "logout",
  HTTP_ERROR_LOGOUT = "httpError",
}

export const useLoginState = () => {
  const queryClient = useQueryClient();
  const [loginState, setLoginState] = useAtom(loginStateAtom);
  const [isInitailized, setInitailized] = useState(false);

  const isLogin = loginState === LoginState.LOGIN;

  const setLogin = () => {
    return setLoginState(LoginState.LOGIN);
  };

  const setNormalLogout = () => {
    deleteToken(queryClient);
    return setLoginState(LoginState.NORMAL_LOGOUT);
  };

  const setHttpErrorLogout = () => {
    deleteToken(queryClient);
    return setLoginState(LoginState.HTTP_ERROR_LOGOUT);
  };

  // 새로고침 등의 이벤트 발생 시, localStorage에 저장된 데이가 jotai 값으로 설정되었는지 여부를 체크
  useEffect(() => {
    if (!isInitailized) {
      setInitailized(true);
    }
  }, [loginState]);

  return {
    loginState,
    isLogin,
    isInitailized,
    setLogin,
    setNormalLogout,
    setHttpErrorLogout,
  };
};
