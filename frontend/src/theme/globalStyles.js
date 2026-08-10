import { alpha } from '@mui/material';
export const globalStyles = (theme) => ({
    '@global': {
        '*': {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
        },
        body: {
            backgroundColor: theme.palette.background.default,
            fontFamily: theme.typography.fontFamily,
            overflowX: 'hidden',
        },
        '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '::-webkit-scrollbar-track': {
            background: alpha(theme.palette.common.black, 0.05),
            borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.common.black, 0.2),
            borderRadius: '10px',
            '&:hover': {
                background: alpha(theme.palette.common.black, 0.3),
            },
        },
        '.gradient-text': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
        },
        '.glass-effect': {
            backdropFilter: 'blur(12px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        },
        '.animate-fade-in': {
            animation: 'fadeIn 0.5s ease-out',
        },
        '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes slideIn': {
            from: { transform: 'translateX(-20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
        },
        '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
        },
    },
});
