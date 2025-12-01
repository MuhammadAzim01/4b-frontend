export const getErrorMessage = (error) => {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
        errorMessage = 'Unauthorized: Invalid credentials';
    } else if (error.response) {
        errorMessage = error.response.non_field_errors?.[0] || error.response.message || 'An error occurred';
        if (errorMessage === 'An error occurred' || !errorMessage) {
            for (const [key, value] of Object.entries(error.response)) {
                if (Array.isArray(value) && value.length > 0) {
                    errorMessage = value[0];
                    break;
                }
            }
        }
    }

    return errorMessage;
};
