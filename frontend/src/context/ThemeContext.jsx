import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
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
                                main: '#6366f1',
                                light: '#818cf8',
                                dark: '#4f46e5',
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#ec4899',
                                light: '#f472b6',
                                dark: '#db2777',
                            },
                            success: {
                                main: '#10b981',
                                light: '#34d399',
                                dark: '#059669',
                            },
                            warning: {
                                main: '#f59e0b',
                                light: '#fbbf24',
                                dark: '#d97706',
                            },
                            error: {
                                main: '#ef4444',
                                light: '#f87171',
                                dark: '#dc2626',
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
                                main: '#818cf8',
                                light: '#a5b4fc',
                                dark: '#6366f1',
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#f472b6',
                                light: '#f9a8d4',
                                dark: '#ec4899',
                            },
                            success: {
                                main: '#34d399',
                                light: '#6ee7b7',
                                dark: '#10b981',
                            },
                            warning: {
                                main: '#fbbf24',
                                light: '#fcd34d',
                                dark: '#f59e0b',
                            },
                            error: {
                                main: '#f87171',
                                light: '#fca5a5',
                                dark: '#ef4444',
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
                    fontFamily: 'Inter, sans-serif',
                    h1: {
                        fontWeight: 700,
                        fontSize: '3.5rem',
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                    },
                    h2: {
                        fontWeight: 700,
                        fontSize: '3rem',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                    },
                    h3: {
                        fontWeight: 600,
                        fontSize: '2.5rem',
                        lineHeight: 1.3,
                    },
                    h4: {
                        fontWeight: 600,
                        fontSize: '2rem',
                        lineHeight: 1.4,
                    },
                    h5: {
                        fontWeight: 600,
                        fontSize: '1.5rem',
                        lineHeight: 1.5,
                    },
                    h6: {
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        lineHeight: 1.6,
                    },
                    button: {
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.02em',
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                shadows: [
                    'none',
                    mode === 'light'
                        ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                        : '0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)',
                    mode === 'light'
                        ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        : '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
                    mode === 'light'
                        ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                        : '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
                    mode === 'light'
                        ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                        : '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
                    ...Array(20).fill(
                        mode === 'light'
                            ? '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                            : '0 25px 50px -12px rgb(0 0 0 / 0.6)'
                    ),
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 10,
                                padding: '10px 24px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: mode === 'light'
                                        ? '0 10px 20px rgba(99, 102, 241, 0.3)'
                                        : '0 10px 20px rgba(129, 140, 248, 0.4)',
                                },
                            },
                            contained: {
                                background: mode === 'light'
                                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                    : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                                '&:hover': {
                                    background: mode === 'light'
                                        ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: mode === 'light'
                                        ? '0 20px 40px rgba(0, 0, 0, 0.1)'
                                        : '0 20px 40px rgba(0, 0, 0, 0.6)',
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 10,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                    },
                                    '&.Mui-focused': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: mode === 'light'
                                            ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                                            : '0 4px 12px rgba(129, 140, 248, 0.3)',
                                    },
                                },
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                fontWeight: 500,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
