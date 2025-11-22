import React from 'react';
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

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
});

function App() {
    return (
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
    );
}

export default App;
