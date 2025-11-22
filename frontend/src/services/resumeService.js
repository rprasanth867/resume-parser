import api from './api';

export const resumeService = {
    async uploadResume(files) {
        const formData = new FormData();

        // Handle both single file and array of files
        if (Array.isArray(files)) {
            files.forEach(file => {
                formData.append('files', file);
            });
        } else {
            formData.append('files', files);
        }

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


};
