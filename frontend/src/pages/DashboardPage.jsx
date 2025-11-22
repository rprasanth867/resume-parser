import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar
} from '@mui/material';
import {
    CloudUpload, Description, AccountCircle, Logout,
    Assessment, Work, TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { resumeService } from '../services/resumeService';
import ThemeToggle from '../components/ThemeToggle';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState(null);
    const [stats, setStats] = useState({ totalResumes: 0, avgScore: 0 });
    const [recentResumes, setRecentResumes] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await resumeService.getUserResumes(1, 5);
            setRecentResumes(data.resumes);

            const completed = data.resumes.filter(r => r.status === 'completed');
            const avgScore = completed.length > 0
                ? completed.reduce((sum, r) => sum + (r.overall_score || 0), 0) / completed.length
                : 0;

            setStats({
                totalResumes: data.pagination.total,
                avgScore: avgScore.toFixed(1)
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Modern AppBar with glassmorphism */}
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
                        Resume Parser
                    </Typography>
                    <ThemeToggle />
                    <IconButton
                        color="inherit"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ ml: 1 }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            }}
                        >
                            {user?.full_name?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="fade-in">
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        Welcome back, {user?.full_name}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Here's what's happening with your resumes today
                    </Typography>

                    {/* Stats Cards with Gradients */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                Total Resumes
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                                {stats.totalResumes}
                                            </Typography>
                                        </Box>
                                        <Description sx={{ fontSize: 60, opacity: 0.3 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                Average Score
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                                {stats.avgScore}
                                            </Typography>
                                        </Box>
                                        <TrendingUp sx={{ fontSize: 60, opacity: 0.3 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                    color: 'white',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px) scale(1.02)',
                                    },
                                }}
                                onClick={() => navigate('/upload')}
                            >
                                <CardContent sx={{ width: '100%', textAlign: 'center' }}>
                                    <CloudUpload sx={{ fontSize: 48, mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Upload New Resume
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Quick Actions */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Quick Actions
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<CloudUpload />}
                                    onClick={() => navigate('/upload')}
                                    sx={{
                                        py: 1.5,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    Upload Resume
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Description />}
                                    onClick={() => navigate('/history')}
                                    sx={{
                                        py: 1.5,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    View History
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Work />}
                                    onClick={() => navigate('/job-descriptions')}
                                    sx={{
                                        py: 1.5,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    Job Descriptions
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Assessment />}
                                    onClick={() => navigate('/matches')}
                                    sx={{
                                        py: 1.5,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                        },
                                    }}
                                >
                                    ATS Matches
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Recent Uploads */}
                    {recentResumes.length > 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                                Recent Uploads
                            </Typography>
                            <Grid container spacing={3}>
                                {recentResumes.map((resume) => (
                                    <Grid item xs={12} md={6} key={resume.id}>
                                        <Card
                                            sx={{
                                                background: mode === 'dark'
                                                    ? 'rgba(30, 41, 59, 0.6)'
                                                    : 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                                            }}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Description color="primary" sx={{ mr: 1 }} />
                                                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                                                        {resume.filename}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" gap={2} mb={2}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            px: 2,
                                                            py: 0.5,
                                                            borderRadius: 2,
                                                            background: resume.status === 'completed'
                                                                ? 'rgba(16, 185, 129, 0.1)'
                                                                : 'rgba(251, 191, 36, 0.1)',
                                                            color: resume.status === 'completed'
                                                                ? 'success.main'
                                                                : 'warning.main',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {resume.status}
                                                    </Typography>
                                                    {resume.overall_score && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                px: 2,
                                                                py: 0.5,
                                                                borderRadius: 2,
                                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                                color: 'white',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Score: {resume.overall_score}/100
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => navigate(`/analysis/${resume.id}`)}
                                                    disabled={resume.status !== 'completed'}
                                                    fullWidth
                                                >
                                                    View Analysis
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default DashboardPage;
