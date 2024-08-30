type BaseAuthProps<
  T extends "jwtToken" | "sessionCookie",
  R extends boolean
> = {
  authType: T;
  isRenew: R;
  authEndTime?: number;
  clientRoutePath: {
    initPagePath: string;
    loginPagePath: string;
  };
};

type JwtTokenAuthProps =
  | (BaseAuthProps<"jwtToken", false> & {
      keyName: {
        token: string;
        expireTime: string;
      };
      serverUrl: {
        logoutUrl: string;
      };
    })
  | (BaseAuthProps<"jwtToken", true> & {
      renewInterval: number;
      keyName: {
        token: string;
        expireTime: string;
      };
      serverUrl: {
        logoutUrl: string;
        authRenewUrl: string;
      };
    });

type SessionCookieAuthProps =
  | (BaseAuthProps<"sessionCookie", false> & {
      keyName: {
        expireTime: string;
      };
      serverUrl: {
        logoutUrl: string;
      };
    })
  | (BaseAuthProps<"sessionCookie", true> & {
      renewInterval: number;
      keyName: {
        expireTime: string;
      };
      serverUrl: {
        logoutUrl: string;
        authRenewUrl: string;
      };
    });

export type AuthManagerProps = JwtTokenAuthProps | SessionCookieAuthProps;
