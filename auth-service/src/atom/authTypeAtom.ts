import { atom } from "recoil";

export enum AuthType {
  JWT_TOKEN = "jwtToken",
  SESSION_COOKIE = "sessionCookie",
}

export const authTypeAtom = atom({
  key: "AUTH_TYPE",
  default: "",
});
