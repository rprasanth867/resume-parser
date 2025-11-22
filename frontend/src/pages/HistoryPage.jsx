import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    AppBar, Toolbar, Chip, Button
} from '@mui/material';
import { ArrowBack, Visibility, Delete } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';

const HistoryPage = () => {
    const navigate = useNavigate();
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
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6">Resume History</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Your Resumes</Typography>
                    <Button variant="contained" onClick={() => navigate('/upload')}>
                        Upload New Resume
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Filename</TableCell>
                                <TableCell>Uploaded</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resumes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No resumes uploaded yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resumes.map((resume) => (
                                    <TableRow key={resume.id}>
                                        <TableCell>{resume.filename}</TableCell>
                                        <TableCell>
                                            {new Date(resume.uploaded_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={resume.status}
                                                color={getStatusColor(resume.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {resume.overall_score ? `${resume.overall_score}/100` : '-'}
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
            </Container>
        </Box>
    );
};

export default HistoryPage;
