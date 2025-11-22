import api from './api';

export const aiService = {
    /**
     * Generate a job description using AI based on requirements
     * @param {string} requirements - User's requirements for the job description
     * @returns {Promise} Generated job description
     */
    generateJobDescription: async (requirements) => {
        const response = await api.post('/job-descriptions/generate', {
            requirements
        });
        return response.data;
    },

    /**
     * Enhance an existing job description using AI
     * @param {number} jdId - Job description ID
     * @returns {Promise} Enhanced job description
     */
    enhanceJobDescription: async (jdId) => {
        const response = await api.post(`/job-descriptions/${jdId}/enhance`);
        return response.data;
    }
};

