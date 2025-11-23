import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Checkbox, FormControlLabel, CircularProgress,
    Alert, List, ListItem, ListItemIcon, ListItemText, CardActions, Slider, 
    Paper, Stack, InputAdornment
} from '@mui/material';
import { ArrowBack, Add, Delete, Edit, Home, AutoAwesome, Search, PersonSearch, Launch } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { resumeService } from '../services/resumeService';
import { aiService } from '../services/aiService';
import StickyLogo from '../components/StickyLogo';

const JobDescriptionsPage = () => {
    const navigate = useNavigate();
    const [jds, setJds] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMatchDialog, setOpenMatchDialog] = useState(false);
    const [openAiDialog, setOpenAiDialog] = useState(false);
    const [openFindCandidateDialog, setOpenFindCandidateDialog] = useState(false);
    const [selectedJD, setSelectedJD] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [aiRequirements, setAiRequirements] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [aiError, setAiError] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [findCandidateError, setFindCandidateError] = useState('');
    const [skillsList, setSkillsList] = useState([]);  // [{skill: "React", weight: 30}, ...]
    const [newSkill, setNewSkill] = useState('');
    const [newSkillWeight, setNewSkillWeight] = useState(10);
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
        setSkillsList([]);
        setNewSkill('');
        setNewSkillWeight(10);
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
        
        // Convert skill_weights object to array for UI
        const skillsArray = jd.skill_weights 
            ? Object.entries(jd.skill_weights).map(([skill, weight]) => ({ skill, weight }))
            : [];
        setSkillsList(skillsArray);
        
        setOpenDialog(true);
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        
        // Check if skill already exists
        if (skillsList.some(s => s.skill.toLowerCase() === newSkill.trim().toLowerCase())) {
            alert('This skill is already added');
            return;
        }
        
        setSkillsList([...skillsList, { skill: newSkill.trim(), weight: newSkillWeight }]);
        setNewSkill('');
        
        // Calculate remaining weight for next skill
        const currentTotal = skillsList.reduce((sum, s) => sum + s.weight, 0) + newSkillWeight;
        const remaining = Math.max(1, 100 - currentTotal);
        setNewSkillWeight(remaining);
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkillsList(skillsList.filter(s => s.skill !== skillToRemove));
    };

    const handleUpdateSkillWeight = (skill, newWeight) => {
        setSkillsList(skillsList.map(s => 
            s.skill === skill ? { ...s, weight: newWeight } : s
        ));
    };

    const handleAutoBalanceWeights = () => {
        if (skillsList.length === 0) return;
        
        const equalWeight = Math.floor(100 / skillsList.length);
        const remainder = 100 - (equalWeight * skillsList.length);
        
        const balancedSkills = skillsList.map((skill, index) => ({
            ...skill,
            weight: index === 0 ? equalWeight + remainder : equalWeight
        }));
        
        setSkillsList(balancedSkills);
    };

    const handleSave = async () => {
        try {
            // Convert skillsList array to required_skills and skill_weights
            const required_skills = skillsList.map(s => s.skill);
            const skill_weights = {};
            skillsList.forEach(s => {
                skill_weights[s.skill] = s.weight;
            });
            
            const data = {
                title: formData.title,
                description: formData.description,
                required_skills: required_skills,
                skill_weights: skill_weights,
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

        setIsMatching(true);
        try {
            await jobDescriptionService.matchResumes(selectedJD.id, selectedResumes);
            setOpenMatchDialog(false);
            navigate('/matches');
        } catch (error) {
            alert('Failed to match resumes');
        } finally {
            setIsMatching(false);
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

            // Auto-populate skills with equal weights adding up to 100%
            if (result.data.required_skills && result.data.required_skills.length > 0) {
                const skillCount = result.data.required_skills.length;
                const equalWeight = Math.floor(100 / skillCount);
                const remainder = 100 - (equalWeight * skillCount);
                
                const skillsWithWeights = result.data.required_skills.map((skill, index) => ({
                    skill: skill,
                    weight: index === 0 ? equalWeight + remainder : equalWeight  // Add remainder to first skill
                }));
                
                setSkillsList(skillsWithWeights);
            } else {
                setSkillsList([]);
            }

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

    const handleOpenFindCandidate = (jd) => {
        setSelectedJD(jd);
        setSelectedPlatforms([]);
        setSearchResults(null);
        setFindCandidateError('');
        setOpenFindCandidateDialog(true);
    };

    const handleTogglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleFindCandidates = async () => {
        if (selectedPlatforms.length === 0) {
            setFindCandidateError('Please select at least one platform.');
            return;
        }
        
        setIsSearching(true);
        setFindCandidateError('');
        try {
            const response = await jobDescriptionService.findCandidates(selectedJD.id, selectedPlatforms);
            setSearchResults(response.data);
            // Keep dialog open to show results
        } catch (error) {
            console.error('Error finding candidates:', error);
            setFindCandidateError(error.response?.data?.error || 'Failed to find candidates. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Box>
            <AppBar position="sticky" elevation={1} sx={{ top: 0, zIndex: 1100 }}>
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
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleOpenMatch(jd)}
                                            >
                                                Match Resume
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                startIcon={<PersonSearch />}
                                                onClick={() => handleOpenFindCandidate(jd)}
                                            >
                                                Find Candidate
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
                    <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Required Skills with Weightage
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                            Add skills and assign weights (%) to indicate their importance. Total weight should be 100%. 
                            <strong> You can add multiple skills</strong> - just keep clicking "Add" for each skill!
                        </Typography>
                        
                        {/* Add New Skill */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                label="Skill Name"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                size="small"
                                sx={{ flexGrow: 1 }}
                                placeholder="e.g., React, Python, AWS"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                            />
                            <TextField
                                label="Weight"
                                type="number"
                                value={newSkillWeight}
                                onChange={(e) => setNewSkillWeight(Math.max(1, Math.min(100, Number(e.target.value))))}
                                size="small"
                                sx={{ width: 100 }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleAddSkill}
                                size="small"
                            >
                                Add
                            </Button>
                        </Stack>

                        {/* Skills List */}
                        {skillsList.length > 0 && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        Skills Added ({skillsList.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" color={
                                            skillsList.reduce((sum, s) => sum + s.weight, 0) === 100 
                                                ? 'success.main' 
                                                : 'warning.main'
                                        }>
                                            Total: {skillsList.reduce((sum, s) => sum + s.weight, 0)}%
                                        </Typography>
                                        {skillsList.reduce((sum, s) => sum + s.weight, 0) !== 100 && (
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                onClick={handleAutoBalanceWeights}
                                            >
                                                Auto-Balance
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                                {skillsList.map((skillItem) => (
                                    <Box key={skillItem.skill} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                {skillItem.skill}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TextField
                                                    type="number"
                                                    value={skillItem.weight}
                                                    onChange={(e) => handleUpdateSkillWeight(skillItem.skill, Math.max(1, Math.min(100, Number(e.target.value))))}
                                                    size="small"
                                                    sx={{ width: 80 }}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    }}
                                                />
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => handleRemoveSkill(skillItem.skill)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Slider
                                            value={skillItem.weight}
                                            onChange={(e, value) => handleUpdateSkillWeight(skillItem.skill, value)}
                                            min={1}
                                            max={100}
                                            size="small"
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={(value) => `${value}%`}
                                        />
                                    </Box>
                                ))}
                                {skillsList.reduce((sum, s) => sum + s.weight, 0) !== 100 && (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                        Total weight should be 100% for optimal matching. Current: {skillsList.reduce((sum, s) => sum + s.weight, 0)}%
                                    </Alert>
                                )}
                            </Paper>
                        )}
                    </Box>
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
            <Dialog open={openMatchDialog} onClose={() => !isMatching && setOpenMatchDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select Resumes to Match</DialogTitle>
                <DialogContent>
                    {isMatching ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={50} sx={{ mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Matching Resumes with AI...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This may take a few moments. Please wait.
                            </Typography>
                        </Box>
                    ) : resumes.length === 0 ? (
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
                    <Button onClick={() => setOpenMatchDialog(false)} disabled={isMatching}>Cancel</Button>
                    <Button
                        onClick={handleMatch}
                        variant="contained"
                        disabled={selectedResumes.length === 0 || isMatching}
                        startIcon={isMatching ? <CircularProgress size={20} /> : null}
                    >
                        {isMatching ? 'Matching...' : `Match Selected (${selectedResumes.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Find Candidate Dialog */}
            <Dialog open={openFindCandidateDialog} onClose={() => !isSearching && setOpenFindCandidateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PersonSearch color="success" />
                        Find Candidates from Job Portals
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {findCandidateError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {findCandidateError}
                        </Alert>
                    )}
                    {selectedJD && !searchResults && (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Searching for candidates matching: <strong>{selectedJD.title}</strong>
                            </Alert>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Select job portals to search for candidates:
                            </Typography>
                            <List>
                                <ListItem button onClick={() => handleTogglePlatform('linkedin')} disabled={isSearching}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedPlatforms.includes('linkedin')}
                                            tabIndex={-1}
                                            disableRipple
                                            disabled={isSearching}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="LinkedIn" 
                                        secondary="Search from LinkedIn job portal"
                                    />
                                </ListItem>
                                <ListItem button onClick={() => handleTogglePlatform('naukri')} disabled={isSearching}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedPlatforms.includes('naukri')}
                                            tabIndex={-1}
                                            disableRipple
                                            disabled={isSearching}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Naukri.com" 
                                        secondary="Search from Naukri job portal"
                                    />
                                </ListItem>
                                <ListItem button onClick={() => handleTogglePlatform('instahyre')} disabled={isSearching}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedPlatforms.includes('instahyre')}
                                            tabIndex={-1}
                                            disableRipple
                                            disabled={isSearching}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Instahyre" 
                                        secondary="Search from Instahyre job portal"
                                    />
                                </ListItem>
                            </List>
                            {selectedPlatforms.length > 0 && !isSearching && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {selectedPlatforms.length} platform(s) selected
                                </Alert>
                            )}
                            {isSearching && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>Searching for candidates...</Typography>
                                </Box>
                            )}
                        </>
                    )}
                    
                    {searchResults && (
                        <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Found <strong>{searchResults.total_candidates}</strong> candidates from {searchResults.platforms_searched.length} platform(s)
                            </Alert>
                            
                            {Object.entries(searchResults.platforms).map(([platform, candidates]) => (
                                candidates.length > 0 && (
                                    <Box key={platform} sx={{ mb: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize', color: 'primary.main' }}>
                                            {platform} ({candidates.length} candidates)
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {candidates.map((candidate, idx) => (
                                                <Grid item xs={12} key={idx}>
                                                    <Card variant="outlined" sx={{ 
                                                        transition: 'all 0.2s',
                                                        '&:hover': { 
                                                            boxShadow: 3,
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}>
                                                        <CardContent>
                                                            <Box display="flex" justifyContent="space-between" alignItems="start">
                                                                <Box>
                                                                    <Typography variant="h6">{candidate.name}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {candidate.title} at {candidate.company}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {candidate.location} • {candidate.experience}
                                                                    </Typography>
                                                                </Box>
                                                                <Chip 
                                                                    label={`${candidate.match_score}% Match`} 
                                                                    color={candidate.match_score >= 85 ? 'success' : candidate.match_score >= 75 ? 'warning' : 'default'}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                            <Box sx={{ mt: 1, mb: 1 }}>
                                                                {candidate.skills.slice(0, 5).map((skill, i) => (
                                                                    <Chip key={i} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                                                ))}
                                                            </Box>
                                                        </CardContent>
                                                        <CardActions>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<Launch />}
                                                                onClick={() => window.open(candidate.profile_url, '_blank')}
                                                                sx={{ ml: 1, mb: 1 }}
                                                            >
                                                                View {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
                                                            </Button>
                                                        </CardActions>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {searchResults ? (
                        <>
                            <Button onClick={() => {
                                setSearchResults(null);
                                setSelectedPlatforms([]);
                                setOpenFindCandidateDialog(false);
                            }}>
                                Close
                            </Button>
                            <Button 
                                variant="outlined"
                                onClick={() => setSearchResults(null)}
                            >
                                New Search
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setOpenFindCandidateDialog(false)} disabled={isSearching}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleFindCandidates} 
                                variant="contained" 
                                color="success"
                                disabled={selectedPlatforms.length === 0 || isSearching}
                                startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
                            >
                                {isSearching ? 'Searching...' : `Search Candidates (${selectedPlatforms.length})`}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
            <StickyLogo />
        </Box>
    );
};

export default JobDescriptionsPage;
