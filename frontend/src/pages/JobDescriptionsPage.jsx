import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Checkbox, FormControlLabel, CircularProgress,
    Alert
} from '@mui/material';
import { ArrowBack, Add, Delete, Edit, Home, AutoAwesome } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { resumeService } from '../services/resumeService';
import { aiService } from '../services/aiService';

const JobDescriptionsPage = () => {
    const navigate = useNavigate();
    const [jds, setJds] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMatchDialog, setOpenMatchDialog] = useState(false);
    const [openAiDialog, setOpenAiDialog] = useState(false);
    const [selectedJD, setSelectedJD] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [aiRequirements, setAiRequirements] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
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

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({ title: '', description: '', required_skills: '', experience_required: '' });
        setOpenDialog(true);
    };

    const handleEdit = (jd) => {
        setIsEditing(true);
        setSelectedJD(jd);
        setFormData({
            title: jd.title,
            description: jd.description,
            required_skills: jd.required_skills ? jd.required_skills.join(', ') : '',
            experience_required: jd.experience_required || ''
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                title: formData.title,
                description: formData.description,
                required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
                experience_required: formData.experience_required
            };

            if (isEditing && selectedJD) {
                await jobDescriptionService.updateJobDescription(selectedJD.id, data);
            } else {
                await jobDescriptionService.createJobDescription(data);
            }

            setOpenDialog(false);
            loadData();
        } catch (error) {
            alert(`Failed to ${isEditing ? 'update' : 'create'} job description`);
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

    const handleOpenMatch = (jd) => {
        setSelectedJD(jd);
        setSelectedResumes([]);
        setOpenMatchDialog(true);
    };

    const handleToggleResume = (resumeId) => {
        setSelectedResumes(prev =>
            prev.includes(resumeId)
                ? prev.filter(id => id !== resumeId)
                : [...prev, resumeId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedResumes(resumes.map(r => r.id));
        } else {
            setSelectedResumes([]);
        }
    };

    const handleMatch = async () => {
        if (selectedResumes.length === 0) {
            alert('Please select at least one resume');
            return;
        }

        try {
            await jobDescriptionService.matchResumes(selectedJD.id, selectedResumes);
            setOpenMatchDialog(false);
            navigate('/matches');
        } catch (error) {
            alert('Failed to match resumes');
        }
    };

    const handleOpenAiGenerator = () => {
        setAiRequirements('');
        setAiError('');
        setOpenAiDialog(true);
    };

    const handleGenerateWithAI = async () => {
        if (!aiRequirements.trim()) {
            setAiError('Please enter your requirements');
            return;
        }

        setIsGenerating(true);
        setAiError('');

        try {
            const result = await aiService.generateJobDescription(aiRequirements);
            
            // Populate form with AI-generated data
            setFormData({
                title: result.data.title || '',
                description: result.data.description || '',
                required_skills: result.data.required_skills ? result.data.required_skills.join(', ') : '',
                experience_required: result.data.experience_required || ''
            });

            // Close AI dialog and open create dialog
            setOpenAiDialog(false);
            setIsEditing(false);
            setOpenDialog(true);
        } catch (error) {
            console.error('Failed to generate job description:', error);
            setAiError(error.response?.data?.error || 'Failed to generate job description. Please check if API key is configured.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
                        <ArrowBack />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
                        <Home />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Job Descriptions
                    </Typography>
                    <Button color="inherit" startIcon={<AutoAwesome />} onClick={handleOpenAiGenerator} sx={{ mr: 1 }}>
                        Generate with AI
                    </Button>
                    <Button color="inherit" startIcon={<Add />} onClick={handleOpenCreate}>
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
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<AutoAwesome />}
                                            onClick={handleOpenAiGenerator}
                                            color="primary"
                                        >
                                            Generate with AI
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Add />}
                                            onClick={handleOpenCreate}
                                        >
                                            Create Manually
                                        </Button>
                                    </Box>
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
                                                onClick={() => handleOpenMatch(jd)}
                                            >
                                                Match Resume
                                            </Button>
                                            <IconButton size="small" color="primary" onClick={() => handleEdit(jd)}>
                                                <Edit />
                                            </IconButton>
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

            {/* Create/Edit JD Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Edit Job Description' : 'Create Job Description'}</DialogTitle>
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
                    <Button onClick={handleSave} variant="contained">
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* AI Generator Dialog */}
            <Dialog open={openAiDialog} onClose={() => !isGenerating && setOpenAiDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AutoAwesome color="primary" />
                        Generate Job Description with AI
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                        Describe the job role, required skills, experience level, and any other requirements. 
                        The AI will generate a professional job description for you.
                    </Typography>
                    {aiError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {aiError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Job Requirements"
                        value={aiRequirements}
                        onChange={(e) => setAiRequirements(e.target.value)}
                        multiline
                        rows={8}
                        placeholder="Example: We need a Senior Full Stack Developer with 5+ years of experience in React, Node.js, and AWS. Should have experience with microservices architecture and agile development. Bachelor's degree in Computer Science required."
                        disabled={isGenerating}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAiDialog(false)} disabled={isGenerating}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleGenerateWithAI} 
                        variant="contained" 
                        disabled={isGenerating || !aiRequirements.trim()}
                        startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Job Description'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Match Resume Dialog */}
            <Dialog open={openMatchDialog} onClose={() => setOpenMatchDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select Resumes to Match</DialogTitle>
                <DialogContent>
                    {resumes.length === 0 ? (
                        <Typography>No completed resumes available</Typography>
                    ) : (
                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedResumes.length === resumes.length}
                                        indeterminate={selectedResumes.length > 0 && selectedResumes.length < resumes.length}
                                        onChange={handleSelectAll}
                                    />
                                }
                                label="Select All"
                                sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', width: '100%' }}
                            />
                            {resumes.map((resume) => (
                                <Box key={resume.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedResumes.includes(resume.id)}
                                                onChange={() => handleToggleResume(resume.id)}
                                            />
                                        }
                                        label={resume.filename}
                                        sx={{ flexGrow: 1 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMatchDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleMatch}
                        variant="contained"
                        disabled={selectedResumes.length === 0}
                    >
                        Match Selected ({selectedResumes.length})
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobDescriptionsPage;
