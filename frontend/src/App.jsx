import React, { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import JobDescriptionsPage from './pages/JobDescriptionsPage';
import MatchResultsPage from './pages/MatchResultsPage';

// Create Theme Context
export const ThemeToggleContext = createContext();

export const useThemeToggle = () => useContext(ThemeToggleContext);

function App() {
    const [mode, setMode] = useState(() => {
        // Get theme preference from localStorage
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'light';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode colors
                            primary: {
                                main: '#2563eb',
                                light: '#3b82f6',
                                dark: '#1e40af',
                            },
                            secondary: {
                                main: '#8b5cf6',
                                light: '#a78bfa',
                                dark: '#7c3aed',
                            },
                            success: {
                                main: '#10b981',
                                light: '#34d399',
                                dark: '#059669',
                            },
                            background: {
                                default: '#f8fafc',
                                paper: '#ffffff',
                            },
                            text: {
                                primary: '#0f172a',
                                secondary: '#475569',
                            },
                        }
                        : {
                            // Dark mode colors
                            primary: {
                                main: '#60a5fa',
                                light: '#93c5fd',
                                dark: '#3b82f6',
                            },
                            secondary: {
                                main: '#a78bfa',
                                light: '#c4b5fd',
                                dark: '#8b5cf6',
                            },
                            success: {
                                main: '#34d399',
                                light: '#6ee7b7',
                                dark: '#10b981',
                            },
                            background: {
                                default: '#0f172a',
                                paper: '#1e293b',
                            },
                            text: {
                                primary: '#f1f5f9',
                                secondary: '#cbd5e1',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontWeight: 700,
                    },
                    h2: {
                        fontWeight: 700,
                    },
                    h3: {
                        fontWeight: 600,
                    },
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                    button: {
                        textTransform: 'none',
                        fontWeight: 500,
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                padding: '8px 16px',
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                },
                            },
                            contained: {
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light' 
                                    ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light'
                                    ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 6,
                                fontWeight: 500,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeToggleContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/upload" element={
                                <ProtectedRoute>
                                    <UploadPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/analysis/:resumeId" element={
                                <ProtectedRoute>
                                    <AnalysisPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/history" element={
                                <ProtectedRoute>
                                    <HistoryPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/job-descriptions" element={
                                <ProtectedRoute>
                                    <JobDescriptionsPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/matches" element={
                                <ProtectedRoute>
                                    <MatchResultsPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ThemeToggleContext.Provider>
    );
}

export default App;
