import React from 'react';
import { Box, useTheme } from '@mui/material';

const StickyLogo = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                zIndex: 1000,
                width: 240,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: isDark 
                    ? '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(102, 126, 234, 0.2)' 
                    : '0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: isDark
                        ? '0 16px 56px rgba(102, 126, 234, 0.35), 0 0 0 2px rgba(102, 126, 234, 0.4)'
                        : '0 16px 56px rgba(0, 0, 0, 0.18), 0 0 0 2px rgba(102, 126, 234, 0.3)',
                }
            }}
        >
            <Box
                component="img"
                src={isDark ? '/logo-light.png' : '/logo-dark.png'}
                alt="Nouveau Labs Logo"
                sx={{
                    width: '95%',
                    height: '85%',
                    objectFit: 'contain',
                    filter: isDark ? 'brightness(1)' : 'brightness(1)',
                }}
            />
        </Box>
    );
};

export default StickyLogo;

