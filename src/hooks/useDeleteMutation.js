import { useMutation } from '@tanstack/react-query';

import { fetchWithAuth } from "../utils/fetchApis";

export const useDeleteMutation = ({
    url,
    onSuccessMessage,
    onErrorMessage,
    headers = {},
    onSuccess = () => {},
    onError = () => {}
}) => {
    return useMutation({
        mutationFn: async () => {
            console.log(`Sending request to ${url}`);
            try {
                const response = await fetchWithAuth(url, {
                    method: 'DELETE',
                    headers: {
                        ...headers,
                    },
                });
                return response;
            } catch (error) {
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