import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Chip,
    AppBar, Toolbar, IconButton, LinearProgress, Divider, Accordion,
    AccordionSummary, AccordionDetails, Badge
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Home, ExpandMore, School, Business, Schedule, Psychology } from '@mui/icons-material';
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

                                                {/* AI-Powered Detailed Breakdown */}
                                                {match.is_ai_scored && match.ai_breakdown && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Badge badgeContent="AI" color="primary" sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', pr: 3 }}>
                                                                Detailed Score Breakdown
                                                            </Typography>
                                                        </Badge>
                                                        
                                                        <Grid container spacing={1} sx={{ mt: 1 }}>
                                                            {/* Academic Institution */}
                                                            {match.ai_breakdown.breakdown?.academic_institution && (
                                                                <Grid item xs={12} sm={6}>
                                                                    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <School color="primary" fontSize="small" />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Academic Institution (10%)
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                                                            {match.ai_breakdown.breakdown.academic_institution.raw_score}/10
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            {match.ai_breakdown.breakdown.academic_institution.college_name}
                                                                        </Typography>
                                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                                            {match.ai_breakdown.breakdown.academic_institution.tier}
                                                                        </Typography>
                                                                    </Card>
                                                                </Grid>
                                                            )}
                                                            
                                                            {/* Academic Score */}
                                                            {match.ai_breakdown.breakdown?.academic_performance && (
                                                                <Grid item xs={12} sm={6}>
                                                                    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Psychology color="secondary" fontSize="small" />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Academic Score (15%)
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                                                            {match.ai_breakdown.breakdown.academic_performance.normalized_score?.toFixed(1)}/10
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            {match.ai_breakdown.breakdown.academic_performance.cgpa 
                                                                                ? `CGPA: ${match.ai_breakdown.breakdown.academic_performance.cgpa}`
                                                                                : `${match.ai_breakdown.breakdown.academic_performance.percentage}%`}
                                                                        </Typography>
                                                                    </Card>
                                                                </Grid>
                                                            )}
                                                            
                                                            {/* Company Quality */}
                                                            {match.ai_breakdown.breakdown?.company_quality && (
                                                                <Grid item xs={12} sm={6}>
                                                                    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Business color="success" fontSize="small" />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Company Quality (20%)
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                                                            {match.ai_breakdown.breakdown.company_quality.average_score?.toFixed(1)}/10
                                                                        </Typography>
                                                                        <Typography variant="caption" display="block">
                                                                            {match.ai_breakdown.breakdown.company_quality.companies?.length || 0} companies
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {match.ai_breakdown.breakdown.company_quality.companies?.[0]?.name || 'N/A'}
                                                                        </Typography>
                                                                    </Card>
                                                                </Grid>
                                                            )}
                                                            
                                                            {/* Job Stability */}
                                                            {match.ai_breakdown.breakdown?.job_stability && (
                                                                <Grid item xs={12} sm={6}>
                                                                    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Schedule color="warning" fontSize="small" />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Job Stability (25%)
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                                                            {match.ai_breakdown.breakdown.job_stability.raw_score}/10
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            Avg: {match.ai_breakdown.breakdown.job_stability.average_tenure_years?.toFixed(1)} years
                                                                        </Typography>
                                                                    </Card>
                                                                </Grid>
                                                            )}
                                                            
                                                            {/* Skills Match */}
                                                            {match.ai_breakdown.breakdown?.skills_match && (
                                                                <Grid item xs={12} sm={6}>
                                                                    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Psychology color="success" fontSize="small" />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Skills Match (30%)
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                                                            {match.ai_breakdown.breakdown.skills_match.raw_score}/10
                                                                        </Typography>
                                                                        <Typography variant="caption" display="block">
                                                                            {match.ai_breakdown.breakdown.skills_match.match_percentage}% Match
                                                                        </Typography>
                                                                        <Box sx={{ mt: 0.5 }}>
                                                                            {match.ai_breakdown.breakdown.skills_match.matched_skills && 
                                                                             match.ai_breakdown.breakdown.skills_match.matched_skills.slice(0, 3).map((skillObj, idx) => (
                                                                                <Chip 
                                                                                    key={idx}
                                                                                    label={typeof skillObj === 'string' ? skillObj : `${skillObj.skill} (${skillObj.weight}%)`}
                                                                                    size="small"
                                                                                    sx={{ mr: 0.5, mt: 0.5, fontSize: '0.65rem' }}
                                                                                />
                                                                            ))}
                                                                            {match.ai_breakdown.breakdown.skills_match.matched_skills && 
                                                                             match.ai_breakdown.breakdown.skills_match.matched_skills.length > 3 && (
                                                                                <Chip 
                                                                                    label={`+${match.ai_breakdown.breakdown.skills_match.matched_skills.length - 3}`}
                                                                                    size="small"
                                                                                    sx={{ mt: 0.5, fontSize: '0.65rem' }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    </Card>
                                                                </Grid>
                                                            )}
                                                        </Grid>

                                                        {/* Full Details Accordion */}
                                                        <Accordion sx={{ mt: 2 }}>
                                                            <AccordionSummary expandIcon={<ExpandMore />}>
                                                                <Typography variant="body2">View Complete Analysis</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {match.ai_breakdown.recommendation && (
                                                                    <Box sx={{ mb: 2 }}>
                                                                        <Typography variant="subtitle2" gutterBottom>
                                                                            Overall Recommendation
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {match.ai_breakdown.recommendation}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                
                                                                {match.ai_breakdown.strengths && match.ai_breakdown.strengths.length > 0 && (
                                                                    <Box sx={{ mb: 2 }}>
                                                                        <Typography variant="subtitle2" gutterBottom color="success.main">
                                                                            Strengths
                                                                        </Typography>
                                                                        {match.ai_breakdown.strengths.map((strength, idx) => (
                                                                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                                                                ✓ {strength}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                                
                                                                {match.ai_breakdown.areas_for_improvement && match.ai_breakdown.areas_for_improvement.length > 0 && (
                                                                    <Box>
                                                                        <Typography variant="subtitle2" gutterBottom color="warning.main">
                                                                            Areas for Improvement
                                                                        </Typography>
                                                                        {match.ai_breakdown.areas_for_improvement.map((area, idx) => (
                                                                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                                                                → {area}
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </Box>
                                                )}

                                                <Divider sx={{ my: 2 }} />

                                                {/* Matched Skills */}
                                                {match.matched_skills && match.matched_skills.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            <CheckCircle fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                            Matched Skills
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {match.matched_skills.map((skill, idx) => {
                                                                // Handle both string format and object format {skill, weight, has_skill}
                                                                const skillName = typeof skill === 'string' ? skill : skill.skill;
                                                                const skillWeight = typeof skill === 'object' && skill.weight ? ` (${skill.weight}%)` : '';
                                                                return (
                                                                    <Chip 
                                                                        key={idx} 
                                                                        label={`${skillName}${skillWeight}`} 
                                                                        size="small" 
                                                                        color="success" 
                                                                    />
                                                                );
                                                            })}
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
                                                            {match.missing_skills.map((skill, idx) => {
                                                                // Handle both string format and object format {skill, weight, has_skill}
                                                                const skillName = typeof skill === 'string' ? skill : skill.skill;
                                                                const skillWeight = typeof skill === 'object' && skill.weight ? ` (${skill.weight}%)` : '';
                                                                return (
                                                                    <Chip 
                                                                        key={idx} 
                                                                        label={`${skillName}${skillWeight}`} 
                                                                        size="small" 
                                                                        color="error" 
                                                                    />
                                                                );
                                                            })}
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
