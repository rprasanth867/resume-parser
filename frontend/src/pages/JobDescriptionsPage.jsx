import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip
} from '@mui/material';
import { ArrowBack, Add, Delete, Work } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { resumeService } from '../services/resumeService';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const JobDescriptionsPage = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
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
        <Box sx={{ minHeight: '100vh' }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
            >
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
                        <ArrowBack />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Job Descriptions
                    </Typography>
                    <ThemeToggle />
                    <Button
                        color="inherit"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ ml: 2 }}
                    >
                        Add New
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="fade-in">
                    <Grid container spacing={3}>
                        {jds.length === 0 ? (
                            <Grid item xs={12}>
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        background: mode === 'dark'
                                            ? 'rgba(30, 41, 59, 0.6)'
                                            : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                        <Work sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                            No job descriptions yet
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                            Create your first job description to start matching resumes
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setOpenDialog(true)}
                                            size="large"
                                        >
                                            Create Your First JD
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) : (
                            jds.map((jd) => (
                                <Grid item xs={12} md={6} key={jd.id}>
                                    <Card
                                        sx={{
                                            borderRadius: 4,
                                            background: mode === 'dark'
                                                ? 'rgba(30, 41, 59, 0.6)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                            height: '100%',
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                {jd.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                {jd.description.substring(0, 150)}...
                                            </Typography>
                                            {jd.required_skills && jd.required_skills.length > 0 && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                        Required Skills
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {jd.required_skills.slice(0, 5).map((skill, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                label={skill}
                                                                size="small"
                                                                sx={{
                                                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
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
                                                    fullWidth
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
                </Box>
            </Container>

            {/* Create JD Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>Create Job Description</DialogTitle>
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
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Match Resume Dialog */}
            <Dialog open={openMatchDialog} onClose={() => setOpenMatchDialog(false)}>
                <DialogTitle sx={{ fontWeight: 600 }}>Select Resume to Match</DialogTitle>
                <DialogContent>
                    {resumes.length === 0 ? (
                        <Typography>No completed resumes available</Typography>
                    ) : (
                        resumes.map((resume) => (
                            <Button
                                key={resume.id}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 1, justifyContent: 'flex-start' }}
                                onClick={() => handleMatch(resume.id)}
                            >
                                {resume.filename}
                            </Button>
                        ))
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenMatchDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobDescriptionsPage;
