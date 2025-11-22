import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Grid, Card, CardContent, Button,
    AppBar, Toolbar, IconButton, Menu, MenuItem
} from '@mui/material';
import {
    CloudUpload, Description, AccountCircle, Logout,
    Assessment, Work
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../services/resumeService';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
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
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Resume Parser
                    </Typography>
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
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.full_name}!
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Description sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4">{stats.totalResumes}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Resumes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Assessment sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4">{stats.avgScore}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Average Score
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                            <CardContent>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<CloudUpload />}
                                    onClick={() => navigate('/upload')}
                                    fullWidth
                                >
                                    Upload Resume
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<CloudUpload />}
                                onClick={() => navigate('/upload')}
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
                            >
                                ATS Matches
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {recentResumes.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Recent Uploads
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {recentResumes.map((resume) => (
                                <Grid item xs={12} md={6} key={resume.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" noWrap>
                                                {resume.filename}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Status: {resume.status}
                                            </Typography>
                                            {resume.overall_score && (
                                                <Typography variant="body2" color="primary">
                                                    Score: {resume.overall_score}/100
                                                </Typography>
                                            )}
                                            <Button
                                                size="small"
                                                sx={{ mt: 1 }}
                                                onClick={() => navigate(`/analysis/${resume.id}`)}
                                                disabled={resume.status !== 'completed'}
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
        </Box>
    );
};

export default DashboardPage;
