export enum StorageType {
  SESSION_STORAGE = "sessionStorage",
  LOCAL_STORAGE = "localStorage",
}

export const storageType = StorageType.SESSION_STORAGE;
export const serverUrl = process.env.REACT_APP_SERVER_URL;
