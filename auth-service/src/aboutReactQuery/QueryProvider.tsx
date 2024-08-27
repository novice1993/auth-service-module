import { PropsWithChildren } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { serialize, deserialize } from "./filterStoredQueries";
import { storageType, StorageType } from "../config";

const queryKeysToPersist = ["loginInfo", "tokenInfo", "cookieInfo"];
const storagekey = "AUTH_INFO";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage:
    storageType === StorageType.SESSION_STORAGE ? sessionStorage : localStorage,
  key: storagekey,
  serialize: (cachingData) => serialize(cachingData, queryKeysToPersist),
  deserialize: (storedData) => deserialize(storedData, queryKeysToPersist),
});

const QueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: Infinity,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default QueryProvider;
