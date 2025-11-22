import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    Container, Box, Paper, Typography, Button, Alert,
    LinearProgress, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CloudUpload, ArrowBack, CheckCircle } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const UploadPage = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFiles(prev => [...prev, ...acceptedFiles]);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 5 * 1024 * 1024 // 5MB
    });

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const result = await resumeService.uploadResume(files);
            setSuccess(true);
            setUploadResult(result);
            setFiles([]); // Clear files after successful upload

            // If single file, redirect to analysis
            if (result.resumes && result.resumes.length === 1) {
                setTimeout(() => {
                    navigate(`/analysis/${result.resumes[0].id}`);
                }, 1500);
            } else {
                // If multiple, redirect to dashboard after delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Modern AppBar */}
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
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 2 }}
                    >
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
                        Upload Resume
                    </Typography>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
                <Box className="fade-in">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 4,
                            background: mode === 'dark'
                                ? 'rgba(30, 41, 59, 0.6)'
                                : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                        }}
                    >
                        <Typography
                            variant="h3"
                            gutterBottom
                            align="center"
                            sx={{ fontWeight: 700, mb: 2 }}
                        >
                            Upload Your Resume
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 4 }}
                        >
                            Upload a PDF or DOCX file (max 5MB) to get instant AI-powered feedback
                        </Typography>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    animation: 'fadeIn 0.3s ease-out',
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert
                                severity="success"
                                icon={<CheckCircle />}
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    animation: 'fadeIn 0.3s ease-out',
                                }}
                            >
                                Resume uploaded successfully! Redirecting to analysis...
                            </Alert>
                        )}

                        <Box
                            {...getRootProps()}
                            sx={{
                                border: '3px dashed',
                                borderColor: isDragActive ? 'primary.main' : mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                borderRadius: 4,
                                p: 6,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragActive
                                    ? mode === 'dark'
                                        ? 'rgba(99, 102, 241, 0.1)'
                                        : 'rgba(99, 102, 241, 0.05)'
                                    : 'transparent',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    background: mode === 'dark'
                                        ? 'rgba(99, 102, 241, 0.05)'
                                        : 'rgba(99, 102, 241, 0.02)',
                                    transform: 'scale(1.01)',
                                },
                            }}
                        >
                            <input {...getInputProps()} />
                            <Box
                                className={isDragActive ? 'pulse' : 'float'}
                                sx={{
                                    display: 'inline-flex',
                                    p: 3,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    mb: 3,
                                }}
                            >
                                <CloudUpload sx={{ fontSize: 64, color: 'white' }} />
                            </Box>
                            {file ? (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                        {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        or click to browse files
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Supported formats: PDF, DOCX
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {uploading && (
                            <Box sx={{ mt: 4 }}>
                                <LinearProgress
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        },
                                    }}
                                />
                                <Typography variant="body1" align="center" sx={{ mt: 2, fontWeight: 500 }}>
                                    Uploading and analyzing your resume...
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate('/dashboard')}
                                disabled={uploading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {uploading ? 'Uploading...' : 'Upload & Analyze'}
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default UploadPage;
