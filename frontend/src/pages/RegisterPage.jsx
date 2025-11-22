import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container, Box, Paper, TextField, Button, Typography,
    Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { mode } = useThemeMode();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.fullName);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: mode === 'dark'
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
            }}
        >
            {/* Animated background elements */}
            <Box
                className="animated-gradient"
                sx={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    opacity: mode === 'dark' ? 0.1 : 0.05,
                    zIndex: 0,
                }}
            />

            {/* Theme toggle in top right */}
            <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <ThemeToggle />
            </Box>

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Box className="fade-in">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 4,
                            background: mode === 'dark'
                                ? 'rgba(30, 41, 59, 0.8)'
                                : 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                            boxShadow: mode === 'dark'
                                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                                : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                className="float"
                                sx={{
                                    display: 'inline-flex',
                                    p: 2,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                    mb: 2,
                                }}
                            >
                                <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Create Account
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sign up to get started with Resume Parser
                            </Typography>
                        </Box>

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

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                margin="normal"
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                margin="normal"
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                margin="normal"
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                margin="normal"
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    mb: 2,
                                }}
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        style={{
                                            textDecoration: 'none',
                                            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Sign in
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default RegisterPage;
