export const getAuthStatus = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAuthenticated = user.access_token && user.role;
    return { isAuthenticated, user };
};