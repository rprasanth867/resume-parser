import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Paper, Typography, Grid, Chip, LinearProgress,
    AppBar, Toolbar, IconButton, Card, CardContent, Alert, Divider
} from '@mui/material';
import { ArrowBack, CheckCircle, Warning, Lightbulb, Home } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';

const AnalysisPage = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAnalysis();
        const interval = setInterval(() => {
            if (analysis?.resume?.status !== 'completed') {
                loadAnalysis();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [resumeId]);

    const loadAnalysis = async () => {
        try {
            const data = await resumeService.getResumeAnalysis(resumeId);
            setAnalysis(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analysis');
            setLoading(false);
        }
    };

    if (loading) {
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
                        <Typography variant="h6">Resume Analysis</Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <LinearProgress />
                    <Typography align="center" sx={{ mt: 2 }}>Loading analysis...</Typography>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6">Resume Analysis</Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    if (analysis?.resume?.status !== 'completed') {
        return (
            <Box>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6">Resume Analysis</Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography variant="h6">Analyzing your resume...</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Status: {analysis?.resume?.status}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const { resume, analysis: analysisData } = analysis;
    const scores = analysisData?.scores || {};
    const feedback = analysisData?.feedback || {};
    const extractedData = analysisData?.extracted_data || {};

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
                    <Typography variant="h6">Resume Analysis</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {resume.filename}
                </Typography>

                {/* Scores */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h3" color="primary" align="center">
                                    {scores.overall || 0}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    Overall Score
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" align="center">
                                    {scores.formatting || 0}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    Formatting
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" align="center">
                                    {scores.content || 0}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    Content
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" align="center">
                                    {scores.keywords || 0}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    Keywords
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Skills */}
                {extractedData.skills && extractedData.skills.length > 0 && (
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Extracted Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {extractedData.skills.map((skill, index) => (
                                <Chip key={index} label={skill} color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Paper>
                )}

                {/* Feedback */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {feedback.strengths && feedback.strengths.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <CheckCircle color="success" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Strengths</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {feedback.strengths.map((item, index) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                        • {item}
                                    </Typography>
                                ))}
                            </Paper>
                        </Grid>
                    )}

                    {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Warning color="warning" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Areas to Improve</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {feedback.weaknesses.map((item, index) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                        • {item}
                                    </Typography>
                                ))}
                            </Paper>
                        </Grid>
                    )}

                    {feedback.suggestions && feedback.suggestions.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Lightbulb color="info" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Suggestions</Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {feedback.suggestions.map((item, index) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                        • {item}
                                    </Typography>
                                ))}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default AnalysisPage;
