import { useEffect, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { useLocation } from "react-router-dom";
import { selectNecessaryData } from "../util/selectNecessaryData";
import { TargetObjectType } from "../util/selectNecessaryData";
import { authExpireTimeAtom } from "../atom/authExpireTimeAtom";
import { authAtom, AuthState } from "../atom/authStateAtom";

/**
 * prevCountDownTimeStamp, accumulatedErrorMillsRef 가 활용되는 이유
 *  - 브라우저가 백그라운드에서 동작하게 될 경우 리소스 효율화를 위해 setInterval 실행 간격을 브라우저 자체적으로 늦춤
 *  - 이로 인해 프로그램이 실행된 탭이 비활성화 되어 있는 경우 만료 시간이 정확히 차감되지 않는 문제 발생 (서버 토큰 유효시간과 불일치 )
 *  - 이에 대한 해결책으로 함수 실행 시간을 보조 지표로 활용하고 (prevCountDownTimeStamp), 타이머 차감 시 명확히 1초를 유지하기 위해 발생하는 오차를 보조할 지표를 마련함 (accumulatedErrorMullsRef)
 */

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
  const expireCountdownEventRef = useRef<NodeJS.Timeout>();

  const prevCountDownTimeStamp = useRef(Date.now());
  const accumulatedErrorMillisRef = useRef(0); // 누적된 오차를 위한 useRef

  const setInitExpireTime = () => {
    const data = selectNecessaryData(loginInfo as TargetObjectType, keyName);
    const serverAuthEndTime = data?.expireTime as number;

    if (!authEndTime && !serverAuthEndTime) return;

    if (authEndTime && serverAuthEndTime) {
      setAuthExpireTime(Math.min(authEndTime, serverAuthEndTime)); // 두 값이 모두 존재하면 더 작은 값을 사용
    } else {
      setAuthExpireTime(authEndTime ?? serverAuthEndTime);
    }
  };

  const setCountDown = () => {
    const currentCountDownTime = Date.now(); // 현재 카운트 다운 발생 시간
    const passedTimeSincePrevCountDown =
      currentCountDownTime - prevCountDownTimeStamp.current; // 경과 시간 : 현재 카운트 다운 발생 시간 - 저번 카운트 다운 발생 시간

    let passedSeconds = Math.floor(passedTimeSincePrevCountDown / 1000); // 경과 시간 가공 : 경과 시간을 1초 단위로 가공함 (ex. 1.7초 -> 1초)
    const intervalErrorMills = passedTimeSincePrevCountDown % 1000; // 오차 시간 : 경과 시간 가공 시 버리는 값 (ex. 0.7초)

    // 오차 시간 누적 : 오차가 발생할 때마다 누적하며, 누적 합계가 1초 이상 될 경우 경과 시간에 1초를 더함
    accumulatedErrorMillisRef.current += intervalErrorMills;
    if (accumulatedErrorMillisRef.current >= 1000) {
      accumulatedErrorMillisRef.current -= 1000;
      passedSeconds += 1;
    }

    if (passedSeconds > 0) {
      setAuthExpireTime((prevState) => {
        const newExpireTime = prevState - passedSeconds * 1000;

        if (prevState === 1000) {
          isAuthExpire.current = true;
        }
        return newExpireTime;
      });

      // 카운트 다운 발생 시간 기록 : 현재 시간에서 setInterval 오차 시간 제외하고 기록
      // ex. 만료 시간 차감 시 0.7초를 버리고 1초를 차감 했으므로 카운트 다운 발생 시간 역시 보정
      //  -> 버려진 0.7초의 오차는 accumulatedErrorMillisRef에 저장되어 관리됨
      prevCountDownTimeStamp.current =
        currentCountDownTime - (intervalErrorMills % 1000);
    }

    if (isAuthExpire.current) {
      isAuthExpire.current = false;
      setLoginState(AuthState.TOKEN_EXPIRE_LOGOUT);
    }
  };

  const setCountDownEvent = () => {
    setInitExpireTime();
    prevCountDownTimeStamp.current = Date.now();
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
