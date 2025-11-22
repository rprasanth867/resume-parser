import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    AppBar, Toolbar, Chip, Button
} from '@mui/material';
import { ArrowBack, Visibility, Delete, Description } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const HistoryPage = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await resumeService.getUserResumes(1, 50);
            setResumes(data.resumes);
        } catch (error) {
            console.error('Failed to load resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resumeId) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await resumeService.deleteResume(resumeId);
                setResumes(resumes.filter(r => r.id !== resumeId));
            } catch (error) {
                alert('Failed to delete resume');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
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
                        Resume History
                    </Typography>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="fade-in">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                Your Resumes
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage all your uploaded resumes
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/upload')}
                            sx={{ px: 3, py: 1.5 }}
                        >
                            Upload New Resume
                        </Button>
                    </Box>

                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 4,
                            background: mode === 'dark'
                                ? 'rgba(30, 41, 59, 0.6)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {resumes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                            <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No resumes uploaded yet
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => navigate('/upload')}
                                                sx={{ mt: 2 }}
                                            >
                                                Upload Your First Resume
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    resumes.map((resume) => (
                                        <TableRow
                                            key={resume.id}
                                            sx={{
                                                '&:hover': {
                                                    background: mode === 'dark'
                                                        ? 'rgba(99, 102, 241, 0.05)'
                                                        : 'rgba(99, 102, 241, 0.02)',
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Description color="primary" sx={{ mr: 1 }} />
                                                    {resume.filename}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(resume.uploaded_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={resume.status}
                                                    color={getStatusColor(resume.status)}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {resume.overall_score ? (
                                                    <Chip
                                                        label={`${resume.overall_score}/100`}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }}
                                                        size="small"
                                                    />
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => navigate(`/analysis/${resume.id}`)}
                                                    disabled={resume.status !== 'completed'}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(resume.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container>
        </Box>
    );
};

export default HistoryPage;
