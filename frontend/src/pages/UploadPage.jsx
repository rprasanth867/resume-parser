import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    Container, Box, Paper, Typography, Button, Alert,
    LinearProgress, AppBar, Toolbar, IconButton
} from '@mui/material';
import { CloudUpload, ArrowBack } from '@mui/icons-material';
import { resumeService } from '../services/resumeService';

const UploadPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024 // 5MB
    });

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const result = await resumeService.uploadResume(file);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/analysis/${result.resume_id}`);
            }, 2000);
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
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6">
                        Upload Resume
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Upload Your Resume
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                        Upload a PDF or DOCX file (max 5MB) to get instant feedback
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Resume uploaded successfully! Redirecting to analysis...
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
                        {file ? (
                            <Typography variant="h6">{file.name}</Typography>
                        ) : (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    or click to browse files
                                </Typography>
                            </>
                        )}
                    </Box>

                    {file && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </Typography>
                        </Box>
                    )}

                    {uploading && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress />
                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Uploading and analyzing your resume...
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
                            disabled={!file || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload & Analyze'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default UploadPage;
