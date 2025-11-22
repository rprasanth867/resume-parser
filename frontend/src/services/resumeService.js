import api from './api';

export const resumeService = {
    async uploadResume(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    async getResumeAnalysis(resumeId) {
        const response = await api.get(`/resumes/${resumeId}/analysis`);
        return response.data;
    },

    async getUserResumes(page = 1, limit = 10) {
        const response = await api.get('/resumes', {
            params: { page, limit }
        });
        return response.data;
    },

    async deleteResume(resumeId) {
        const response = await api.delete(`/resumes/${resumeId}`);
        return response.data;
    },

    async downloadResume(resumeId) {
        const response = await api.get(`/resumes/${resumeId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
