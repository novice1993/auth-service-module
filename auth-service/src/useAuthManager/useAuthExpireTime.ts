import { useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { useLocation } from "react-router-dom";
import { selectNecessaryData } from "../util/selectNecessaryData";
import { authExpireTimeAtom } from "../atom/authExpireTimeAtom";
import { TargetObjectType } from "../util/selectNecessaryData";
import { authAtom, AuthState } from "../atom/authStateAtom";

const useAuthExpireTime = (
  loginInfo: unknown,
  authEndTime: number | undefined,
  keyName: { token?: string; expireTime: string },
  loginPagePath: string
) => {
  const location = useLocation();

  const setLoginState = useSetRecoilState(authAtom);
  const setAuthExpireTime = useSetRecoilState(authExpireTimeAtom);

  const isAuthExpire = useRef(false);
  const expireCountdownEventRef = useRef<NodeJS.Timeout | null>(null);

  const setInitExpireTime = () => {
    const data = selectNecessaryData(loginInfo as TargetObjectType, keyName);
    const serverAuthEndTime = data?.expireTime as number;

    if (!authEndTime && !serverAuthEndTime) return;

    if (authEndTime && serverAuthEndTime) {
      setAuthExpireTime(Math.min(authEndTime, serverAuthEndTime)); // 두 값이 모두 존재하면 더 작은 값을 사용 (Client에서 설정한 end time이 Server에서 설정한 end time을 넘지 못하도록)
    } else {
      setAuthExpireTime(authEndTime ?? serverAuthEndTime);
    }
  };

  const setCountDown = () => {
    setAuthExpireTime((prevState: number) => {
      if (prevState === 1000) isAuthExpire.current = true; // 1) 1초 남았을 때 expire 만료 상태 변경
      return prevState - 1000; // 2) 2초 이상 남았을 때는 -1초 한 값으로 변경
    });

    // 1)에서 변경된 값 받아서 로그아웃 처리
    if (isAuthExpire.current) {
      isAuthExpire.current = false;
      setLoginState(AuthState.TOKEN_EXPIRE_LOGOUT);
    }
  };

  const setCountDownEvent = () => {
    setInitExpireTime();
    expireCountdownEventRef.current = setInterval(setCountDown, 1000);
  };

  const setClearCountDownEvent = () => {
    expireCountdownEventRef.current &&
      clearInterval(expireCountdownEventRef.current);
  };

  useEffect(() => {
    // loginInfo = tanstck-query로 caching 해놓은 데이터
    // -> 새로고침 시 localStorage에서 데이터를 불러와서 비동기로 갱신하므로 데이터 설정될 수 있도록 useEffect+IF문 적용
    if (!loginInfo || location.pathname === loginPagePath) {
      return;
    } else {
      setCountDownEvent();
    }

    return () => setClearCountDownEvent(); // 이전 카운트다운 이벤트 존재할 경우 제거
  }, [location.pathname, loginInfo]);
};

export default useAuthExpireTime;
