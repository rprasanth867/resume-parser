import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    Container, Box, Paper, Typography, Button, Alert,
    LinearProgress, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CloudUpload, ArrowBack, Home } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';

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
            <AppBar position="static">
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
                    <Typography variant="h6">
                        Upload Resume
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom align="center">
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
                            border: '2px dashed',
                            borderColor: isDragActive ? 'primary.main' : 'grey.400',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                            transition: 'all 0.3s',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop the files here' : 'Drag & drop resumes here'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            or click to browse files
                        </Typography>
                    </Box>

                    {files.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Selected Files ({files.length}):
                            </Typography>
                            {files.map((file, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1,
                                        mb: 1,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography variant="body2">
                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </Typography>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        disabled={uploading}
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
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                        >
                            {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? files.length : ''} Resume${files.length !== 1 ? 's' : ''}`}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default UploadPage;
