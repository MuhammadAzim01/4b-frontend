import { useQuery } from "@tanstack/react-query";

export const useFetchQuery = ({
  url,
  queryKey,
  fetchFunction,
  enabled = true,
  staleTime = 0,
  cacheTime = 5 * 60 * 1000,
}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetchFunction(url);
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    },
    enabled,
    staleTime,
    refetchOnMount: false, 
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      console.error(error.message);
    },
  });
};
