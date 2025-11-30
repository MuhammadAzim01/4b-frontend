import { useMutation } from "@tanstack/react-query";

export const useCreateUpdateMutation = ({
  url,
  method,
  fetchFunction,
  onSuccessMessage,
  onErrorMessage,
  headers = {},
  onSuccess = () => {},
  onError = () => {},
}) => {
  return useMutation({
    mutationFn: async (body) => {
      try {
        const fullUrl = typeof url === "function" ? url(body) : url;
        console.log(`Sending request to ${fullUrl} with body:`, body);
        const response = await fetchFunction(fullUrl, {
          method,
          headers: {
            ...headers,
          },
          body: body,
        });
        console.log("Response:", response);
        return response;
      } catch (error) {
        console.error("Request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (error) => {
      onError(error);
    },
  });
};
