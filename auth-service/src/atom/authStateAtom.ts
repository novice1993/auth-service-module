import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import { storageType, StorageType } from "../config";

export enum AuthState {
  LOGIN = "login",
  NORMAL_LOGOUT = "normalLogout",
  HTTP_ERROR_LOGOUT = "httpErrorLogout",
  TOKEN_EXPIRE_LOGOUT = "tokenExpireLogout",
}

const { persistAtom } = recoilPersist({
  key: "AUTH_STATE",
  storage:
    storageType === StorageType.SESSION_STORAGE ? sessionStorage : localStorage,
});

export const authStateAtom = atom({
  key: "AUTH_STATE",
  default: AuthState.NORMAL_LOGOUT,
  effects_UNSTABLE: [persistAtom],
});
