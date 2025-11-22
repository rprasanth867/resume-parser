import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Chip,
    AppBar, Toolbar, IconButton, LinearProgress, Divider
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Home } from '@mui/icons-material';
import { jobDescriptionService } from '../services/jobDescriptionService';

const MatchResultsPage = () => {
    const navigate = useNavigate();
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
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
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
                    <Typography variant="h6">ATS Match Results</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Resume-JD Match Results
                </Typography>

                {loading ? (
                    <Box sx={{ mt: 4 }}>
                        <LinearProgress />
                    </Box>
                ) : matches.length === 0 ? (
                    <Card sx={{ mt: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                No matches yet. Create a job description and match it with your resumes.
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        {matches.map((match) => (
                            <Grid item xs={12} key={match.id}>
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <Typography variant="h6" gutterBottom>
                                                    {match.resume.filename}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    vs {match.job_description.title}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />

                                                {/* Scores */}
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Overall Match
                                                        </Typography>
                                                        <Typography variant="h5" color={getScoreColor(match.scores.overall_match)}>
                                                            {match.scores.overall_match}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Skills Match
                                                        </Typography>
                                                        <Typography variant="h6">
                                                            {match.scores.skills_match}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Experience
                                                        </Typography>
                                                        <Typography variant="h6">
                                                            {match.scores.experience_match}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Education
                                                        </Typography>
                                                        <Typography variant="h6">
                                                            {match.scores.education_match}%
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                <Divider sx={{ my: 2 }} />

                                                {/* Matched Skills */}
                                                {match.matched_skills && match.matched_skills.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            <CheckCircle fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                            Matched Skills
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {match.matched_skills.map((skill, idx) => (
                                                                <Chip key={idx} label={skill} size="small" color="success" />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Missing Skills */}
                                                {match.missing_skills && match.missing_skills.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            <Cancel fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                            Missing Skills
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {match.missing_skills.map((skill, idx) => (
                                                                <Chip key={idx} label={skill} size="small" color="error" />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Recommendations */}
                                                {match.recommendations && match.recommendations.length > 0 && (
                                                    <Box>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Recommendations
                                                        </Typography>
                                                        {match.recommendations.map((rec, idx) => (
                                                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
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
                                                        bgcolor: 'background.default',
                                                        borderRadius: 2,
                                                        p: 2
                                                    }}
                                                >
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h2" color={getScoreColor(match.scores.overall_match)}>
                                                            {match.scores.overall_match}%
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
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
            </Container>
        </Box>
    );
};

export default MatchResultsPage;
