import api from './api';

export const jobDescriptionService = {
    async createJobDescription(data) {
        const response = await api.post('/job-descriptions', data);
        return response.data;
    },

    async getJobDescriptions() {
        const response = await api.get('/job-descriptions');
        return response.data;
    },

    async getJobDescription(jdId) {
        const response = await api.get(`/job-descriptions/${jdId}`);
        return response.data;
    },

    async matchResumeToJD(jdId, resumeId) {
        const response = await api.post(`/job-descriptions/${jdId}/match/${resumeId}`);
        return response.data;
    },

    async deleteJobDescription(jdId) {
        const response = await api.delete(`/job-descriptions/${jdId}`);
        return response.data;
    },

    async getAllMatches() {
        const response = await api.get('/job-descriptions/matches');
        return response.data;
    }
};
