import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Chip,
    AppBar, Toolbar, IconButton, LinearProgress, Divider
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, TrendingUp } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const MatchResultsPage = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const data = await jobDescriptionService.getAllMatches();
            setMatches(data.matches);
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success.main';
        if (score >= 60) return 'warning.main';
        return 'error.main';
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
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
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
                        ATS Match Results
                    </Typography>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="fade-in">
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                        Resume-JD Match Results
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        AI-powered ATS compatibility analysis
                    </Typography>

                    {loading ? (
                        <Box sx={{ mt: 4 }}>
                            <LinearProgress />
                        </Box>
                    ) : matches.length === 0 ? (
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
                                <TrendingUp sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                    No matches yet
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Create a job description and match it with your resumes to see results here
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {matches.map((match) => (
                                <Grid item xs={12} key={match.id}>
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
                                        <CardContent sx={{ p: 4 }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={8}>
                                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                                        {match.resume.filename}
                                                    </Typography>
                                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                                        vs {match.job_description.title}
                                                    </Typography>
                                                    <Divider sx={{ my: 3 }} />

                                                    {/* Scores */}
                                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                                        <Grid item xs={6} sm={3}>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: mode === 'dark'
                                                                        ? 'rgba(99, 102, 241, 0.1)'
                                                                        : 'rgba(99, 102, 241, 0.05)',
                                                                    border: `2px solid ${mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                                                                }}
                                                            >
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                    Overall Match
                                                                </Typography>
                                                                <Typography variant="h4" sx={{ color: getScoreColor(match.scores.overall_match), fontWeight: 700 }}>
                                                                    {match.scores.overall_match}%
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} sm={3}>
                                                            <Box sx={{ p: 2, borderRadius: 2, background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                    Skills Match
                                                                </Typography>
                                                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                    {match.scores.skills_match}%
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} sm={3}>
                                                            <Box sx={{ p: 2, borderRadius: 2, background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                    Experience
                                                                </Typography>
                                                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                    {match.scores.experience_match}%
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} sm={3}>
                                                            <Box sx={{ p: 2, borderRadius: 2, background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                    Education
                                                                </Typography>
                                                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                    {match.scores.education_match}%
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <Divider sx={{ my: 3 }} />

                                                    {/* Matched Skills */}
                                                    {match.matched_skills && match.matched_skills.length > 0 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Box display="flex" alignItems="center" mb={1.5}>
                                                                <CheckCircle color="success" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                    Matched Skills
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {match.matched_skills.map((skill, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={skill}
                                                                        size="small"
                                                                        sx={{
                                                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {/* Missing Skills */}
                                                    {match.missing_skills && match.missing_skills.length > 0 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Box display="flex" alignItems="center" mb={1.5}>
                                                                <Cancel color="error" sx={{ mr: 1 }} />
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                    Missing Skills
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {match.missing_skills.map((skill, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={skill}
                                                                        size="small"
                                                                        sx={{
                                                                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {/* Recommendations */}
                                                    {match.recommendations && match.recommendations.length > 0 && (
                                                        <Box>
                                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                                Recommendations
                                                            </Typography>
                                                            {match.recommendations.map((rec, idx) => (
                                                                <Typography key={idx} variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                                                                    • {rec}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Grid>

                                                <Grid item xs={12} md={4}>
                                                    <Box
                                                        sx={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            borderRadius: 3,
                                                            p: 4,
                                                        }}
                                                    >
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="h1" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                                                                {match.scores.overall_match}%
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                                Match Score
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default MatchResultsPage;
