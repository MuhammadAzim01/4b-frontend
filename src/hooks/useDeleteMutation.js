import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from "../utils/errors";
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
        onMutate: () => {
            toast.loading('Deleting...', { id: `${url}-loading` });
        },
        onSuccess: (data) => {
            toast.dismiss(`${url}-loading`);
            if (onSuccessMessage) {
                toast.success(onSuccessMessage, {
                    style: {
                        backgroundColor: "#ffffff",
                    },
                });
            }
            onSuccess(data);
        },
        onError: (error) => {
            if (onErrorMessage) {
                toast.dismiss(`${url}-loading`);
                const errorMessage = getErrorMessage(error);
                toast.error(`${onErrorMessage}: ${errorMessage}`);
            }
            onError(error);
        },
    });
};