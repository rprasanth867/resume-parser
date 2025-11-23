import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    Container, Box, Paper, Typography, Button, Alert,
    LinearProgress, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CloudUpload, ArrowBack, Home } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';
import StickyLogo from '../components/StickyLogo';

const UploadPage = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
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
        <Box>
            <AppBar position="sticky" elevation={1} sx={{ top: 0, zIndex: 1100 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 1 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 1 }}
                    >
                        <Home />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Upload Resume
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography variant="h4" gutterBottom align="center" fontWeight={700}>
                        Upload Resumes
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                        Upload PDF or DOCX files (max 5MB each) to get instant feedback
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {uploadResult?.message || 'Resumes uploaded successfully!'} Redirecting...
                        </Alert>
                    )}

                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '3px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            borderRadius: 3,
                            p: 6,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isDragActive ? 'action.hover' : 'action.hover',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.selected',
                                transform: 'scale(1.01)',
                            },
                            '&::before': isDragActive ? {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                zIndex: 0,
                            } : undefined
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 72, color: 'primary.main', mb: 2, position: 'relative', zIndex: 1 }} />
                        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ position: 'relative', zIndex: 1 }}>
                            {isDragActive ? 'Drop the files here' : 'Drag & drop resumes here'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
                            or click to browse files
                        </Typography>
                    </Box>

                    {files.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Selected Files ({files.length}):
                            </Typography>
                            {files.map((file, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        mb: 1.5,
                                        bgcolor: 'action.hover',
                                        borderRadius: 2,
                                        border: '2px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ flex: 1 }}>
                                        {file.name} <Typography component="span" variant="caption" color="text.secondary">({(file.size / 1024).toFixed(2)} KB)</Typography>
                                    </Typography>
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        disabled={uploading}
                                        sx={{ 
                                            minWidth: 'auto',
                                            fontWeight: 600,
                                            borderRadius: 1.5
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {uploading && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress />
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Uploading and analyzing {files.length} resume{files.length !== 1 ? 's' : ''}...
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/dashboard')}
                            disabled={uploading}
                            sx={{
                                py: 1.5,
                                fontWeight: 600,
                                borderWidth: 2,
                                borderRadius: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                            sx={{
                                py: 1.5,
                                fontWeight: 600,
                                borderRadius: 2,
                                background: files.length > 0 && !uploading 
                                    ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                                    : undefined,
                                '&:hover': files.length > 0 && !uploading ? {
                                    background: 'linear-gradient(135deg, #0e8070 0%, #2dd55f 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(17, 153, 142, 0.4)',
                                } : undefined,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? files.length : ''} Resume${files.length !== 1 ? 's' : ''}`}
                        </Button>
                    </Box>
                </Paper>
            </Container>
            <StickyLogo />
        </Box>
    );
};

export default UploadPage;
