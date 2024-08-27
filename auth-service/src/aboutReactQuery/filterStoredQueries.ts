import { Query } from '@tanstack/react-query';
import { PersistedClient } from '@tanstack/react-query-persist-client';

const filterQueries = (queries: Query[], keys: string[]) => {
  return queries.filter(query => keys.includes(query.queryKey[0] as string));
};

// 직렬화 함수 (caching 데이터 -> localStorage 저장)
export const serialize = (client: PersistedClient, keys: string[]): string => {
  const filteredClient = {
    ...client,
    clientState: {
      ...client.clientState,
      queries: filterQueries(client.clientState.queries as Query[], keys)
    }
  };
  return JSON.stringify(filteredClient);
};

// 역직렬화 함수 (localStorage 데이터 -> caching 데이터로 불러오기)
export const deserialize = (serializedClient: string, keys: string[]): PersistedClient => {
  const client: PersistedClient = JSON.parse(serializedClient);
  return {
    ...client,
    clientState: {
      ...client.clientState,
      queries: filterQueries(client.clientState.queries as Query[], keys)
    }
  };
};
