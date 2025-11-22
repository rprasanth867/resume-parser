import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Paper, Typography, Grid, Chip, LinearProgress,
    AppBar, Toolbar, IconButton, Card, CardContent, Alert, Divider
} from '@mui/material';
import { ArrowBack, CheckCircle, Warning, Lightbulb, TrendingUp } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const AnalysisPage = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const { mode } = useThemeMode();
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
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Resume Analysis</Typography>
                        <ThemeToggle />
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
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Resume Analysis</Typography>
                        <ThemeToggle />
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
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Resume Analysis</Typography>
                        <ThemeToggle />
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
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
                        Resume Analysis
                    </Typography>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="fade-in">
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                        {resume.filename}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        AI-powered analysis results
                    </Typography>

                    {/* Score Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                        {scores.overall || 0}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        Overall Score
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card
                                sx={{
                                    background: mode === 'dark'
                                        ? 'rgba(30, 41, 59, 0.6)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                        {scores.formatting || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Formatting
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card
                                sx={{
                                    background: mode === 'dark'
                                        ? 'rgba(30, 41, 59, 0.6)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                        {scores.content || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Content
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card
                                sx={{
                                    background: mode === 'dark'
                                        ? 'rgba(30, 41, 59, 0.6)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                        {scores.keywords || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Keywords
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Skills */}
                    {extractedData.skills && extractedData.skills.length > 0 && (
                        <Paper
                            sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 4,
                                background: mode === 'dark'
                                    ? 'rgba(30, 41, 59, 0.6)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                            }}
                        >
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Extracted Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {extractedData.skills.map((skill, index) => (
                                    <Chip
                                        key={index}
                                        label={skill}
                                        sx={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            px: 1,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Feedback */}
                    <Grid container spacing={3}>
                        {feedback.strengths && feedback.strengths.length > 0 && (
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        background: mode === 'dark'
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'rgba(16, 185, 129, 0.05)',
                                        border: `2px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                                    }}
                                >
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 28 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Strengths</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    {feedback.strengths.map((item, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                            • {item}
                                        </Typography>
                                    ))}
                                </Paper>
                            </Grid>
                        )}

                        {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        background: mode === 'dark'
                                            ? 'rgba(251, 191, 36, 0.1)'
                                            : 'rgba(251, 191, 36, 0.05)',
                                        border: `2px solid ${mode === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)'}`,
                                    }}
                                >
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <Warning sx={{ color: 'warning.main', mr: 1.5, fontSize: 28 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Areas to Improve</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    {feedback.weaknesses.map((item, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                            • {item}
                                        </Typography>
                                    ))}
                                </Paper>
                            </Grid>
                        )}

                        {feedback.suggestions && feedback.suggestions.length > 0 && (
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        background: mode === 'dark'
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'rgba(99, 102, 241, 0.05)',
                                        border: `2px solid ${mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                                    }}
                                >
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <Lightbulb sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Suggestions</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    {feedback.suggestions.map((item, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                            • {item}
                                        </Typography>
                                    ))}
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default AnalysisPage;
