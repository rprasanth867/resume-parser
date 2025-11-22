import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { resumeService } from '../services/resumeService';

const JobDescriptionsPage = () => {
    const navigate = useNavigate();
    const [jds, setJds] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMatchDialog, setOpenMatchDialog] = useState(false);
    const [selectedJD, setSelectedJD] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: '',
        experience_required: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jdData, resumeData] = await Promise.all([
                jobDescriptionService.getJobDescriptions(),
                resumeService.getUserResumes(1, 50)
            ]);
            setJds(jdData.job_descriptions);
            setResumes(resumeData.resumes.filter(r => r.status === 'completed'));
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleCreate = async () => {
        try {
            const data = {
                title: formData.title,
                description: formData.description,
                required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
                experience_required: formData.experience_required
            };
            await jobDescriptionService.createJobDescription(data);
            setOpenDialog(false);
            setFormData({ title: '', description: '', required_skills: '', experience_required: '' });
            loadData();
        } catch (error) {
            alert('Failed to create job description');
        }
    };

    const handleDelete = async (jdId) => {
        if (window.confirm('Delete this job description?')) {
            try {
                await jobDescriptionService.deleteJobDescription(jdId);
                loadData();
            } catch (error) {
                alert('Failed to delete job description');
            }
        }
    };

    const handleMatch = async (resumeId) => {
        try {
            const result = await jobDescriptionService.matchResumeToJD(selectedJD.id, resumeId);
            setOpenMatchDialog(false);
            navigate('/matches');
        } catch (error) {
            alert('Failed to match resume');
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Job Descriptions
                    </Typography>
                    <Button color="inherit" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                        Add New
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {jds.length === 0 ? (
                        <Grid item xs={12}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No job descriptions yet
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => setOpenDialog(true)}
                                        sx={{ mt: 2 }}
                                    >
                                        Create Your First JD
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ) : (
                        jds.map((jd) => (
                            <Grid item xs={12} md={6} key={jd.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {jd.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {jd.description.substring(0, 150)}...
                                        </Typography>
                                        {jd.required_skills && jd.required_skills.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                {jd.required_skills.slice(0, 5).map((skill, idx) => (
                                                    <Chip key={idx} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                                ))}
                                            </Box>
                                        )}
                                        <Box display="flex" gap={1}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => {
                                                    setSelectedJD(jd);
                                                    setOpenMatchDialog(true);
                                                }}
                                            >
                                                Match Resume
                                            </Button>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(jd.id)}>
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

            {/* Create JD Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create Job Description</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Job Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Required Skills (comma-separated)"
                        value={formData.required_skills}
                        onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                        margin="normal"
                        placeholder="Python, React, AWS"
                    />
                    <TextField
                        fullWidth
                        label="Experience Required"
                        value={formData.experience_required}
                        onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                        margin="normal"
                        placeholder="3-5 years"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Match Resume Dialog */}
            <Dialog open={openMatchDialog} onClose={() => setOpenMatchDialog(false)}>
                <DialogTitle>Select Resume to Match</DialogTitle>
                <DialogContent>
                    {resumes.length === 0 ? (
                        <Typography>No completed resumes available</Typography>
                    ) : (
                        resumes.map((resume) => (
                            <Button
                                key={resume.id}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 1 }}
                                onClick={() => handleMatch(resume.id)}
                            >
                                {resume.filename}
                            </Button>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMatchDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobDescriptionsPage;
