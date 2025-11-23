import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Menu, MenuItem, Tooltip, Switch
} from '@mui/material';
import {
    CloudUpload, Description, AccountCircle, Logout,
    Assessment, Work, Home, Brightness4, Brightness7
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../App';
import { resumeService } from '../services/resumeService';
import StickyLogo from '../components/StickyLogo';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeToggle();
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
        <Box>
            <AppBar position="sticky" elevation={1} sx={{ top: 0, zIndex: 1100 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        Resume Parser
                    </Typography>
                    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                        <IconButton
                            color="inherit"
                            onClick={toggleTheme}
                            sx={{ mr: 1 }}
                        >
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 1 }}
                    >
                        <Home />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <AccountCircle />
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
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" gutterBottom fontWeight={700}>
                        Welcome, {user?.full_name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your resumes and track your analysis
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}>
                            <CardContent sx={{ py: 3, position: 'relative', zIndex: 1 }}>
                                <Description sx={{ fontSize: 40, opacity: 0.9, mb: 1 }} />
                                <Typography variant="h2" fontWeight={800} sx={{ mb: 0.5 }}>
                                    {stats.totalResumes}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                                    Total Resumes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}>
                            <CardContent sx={{ py: 3, position: 'relative', zIndex: 1 }}>
                                <Assessment sx={{ fontSize: 40, opacity: 0.9, mb: 1 }} />
                                <Typography variant="h2" fontWeight={800} sx={{ mb: 0.5 }}>
                                    {stats.avgScore}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                                    Average Score
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 24px rgba(17, 153, 142, 0.4)',
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}>
                            <CardContent sx={{ py: 3, position: 'relative', zIndex: 1 }}>
                                <CloudUpload sx={{ fontSize: 40, opacity: 0.9, mb: 1 }} />
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, opacity: 0.95 }}>
                                    Upload New Resume
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/upload')}
                                    fullWidth
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                                        color: 'white',
                                        backdropFilter: 'blur(10px)',
                                        fontWeight: 600,
                                        py: 1.5,
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.35)',
                                            border: '2px solid rgba(255, 255, 255, 0.5)',
                                            transform: 'scale(1.02)',
                                        }
                                    }}
                                >
                                    Upload Now
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card 
                                onClick={() => navigate('/upload')}
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 10px 20px rgba(102, 126, 234, 0.25)',
                                        border: '2px solid rgba(102, 126, 234, 0.3)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <CloudUpload sx={{ fontSize: 48, color: '#667eea', mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        Upload Resume
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add new resume
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card 
                                onClick={() => navigate('/history')}
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.08) 0%, rgba(245, 87, 108, 0.08) 100%)',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 10px 20px rgba(240, 147, 251, 0.25)',
                                        border: '2px solid rgba(240, 147, 251, 0.3)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Description sx={{ fontSize: 48, color: '#f093fb', mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        View History
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Past uploads
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card 
                                onClick={() => navigate('/job-descriptions')}
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.08) 0%, rgba(56, 239, 125, 0.08) 100%)',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 10px 20px rgba(17, 153, 142, 0.25)',
                                        border: '2px solid rgba(17, 153, 142, 0.3)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Work sx={{ fontSize: 48, color: '#11998e', mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        Job Descriptions
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Manage JDs
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card 
                                onClick={() => navigate('/matches')}
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 10px 20px rgba(251, 146, 60, 0.25)',
                                        border: '2px solid rgba(251, 146, 60, 0.3)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Assessment sx={{ fontSize: 48, color: '#fb923c', mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        ATS Matches
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        View results
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {recentResumes.length > 0 && (
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                            Recent Uploads
                        </Typography>
                        <Grid container spacing={3}>
                            {recentResumes.map((resume) => (
                                <Grid item xs={12} md={6} key={resume.id}>
                                    <Card sx={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        border: '2px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                            borderColor: 'primary.main',
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: resume.status === 'completed' 
                                                ? 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)'
                                                : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" alignItems="start" mb={2}>
                                                <Description sx={{ fontSize: 40, color: 'primary.main', mr: 2, mt: 0.5 }} />
                                                <Box flex={1}>
                                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                                                        {resume.filename}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                        <Box
                                                            sx={{
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: 2,
                                                                bgcolor: resume.status === 'completed' ? 'success.main' : 'warning.main',
                                                                color: 'white',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}
                                                        >
                                                            {resume.status}
                                                        </Box>
                                                        {resume.overall_score && (
                                                            <Box
                                                                sx={{
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: 2,
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    color: 'white',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                Score: {resume.overall_score}/100
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                onClick={() => navigate(`/analysis/${resume.id}`)}
                                                disabled={resume.status !== 'completed'}
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    py: 1.2,
                                                    fontWeight: 600,
                                                    background: resume.status === 'completed'
                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        : undefined,
                                                    '&:hover': resume.status === 'completed' ? {
                                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                    } : undefined,
                                                }}
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
            </Container>
            <StickyLogo />
        </Box>
    );
};

export default DashboardPage;
