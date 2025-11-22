import api from './api';

export const authService = {
    async register(email, password, fullName) {
        const response = await api.post('/auth/register', {
            email,
            password,
            full_name: fullName
        });
        return response.data;
    },

    async login(email, password) {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user info
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
