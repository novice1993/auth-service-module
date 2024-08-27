import { useQuery, useQueryClient } from '@tanstack/react-query';

const useGetCachingData = <T>({ queryKey }: { queryKey: [string] }) => {
  const queryClient = useQueryClient();
  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: queryKey,
    queryFn: () => queryClient.getQueryData(queryKey) as T,
    enabled: false
  });

  return { data, isFetching, isError, isSuccess };
};

export default useGetCachingData;
