import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'rotate(180deg)',
                    },
                }}
            >
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
