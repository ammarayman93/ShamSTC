import { createTheme } from '@mui/material/styles';
// لوحة الألوان المتقدمة
export const colors = {
    // الألوان الأساسية
    primary: {
        main: '#6366f1', // Indigo 500 - عصري وجذاب
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ec4899', // Pink 500 - تباين جميل
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff',
    },
    // الألوان الداعمة
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
    info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
    },
    // الألوان المحايدة
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
    // خلفيات
    background: {
        light: '#f8fafc',
        dark: '#0f172a',
    },
};
// الأنماط المشتركة
const sharedComponents = {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                scrollBehavior: 'smooth',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                padding: '10px 20px',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-1px)',
                },
            },
            contained: {
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                },
            },
            outlined: {
                borderWidth: 1.5,
                '&:hover': {
                    borderWidth: 1.5,
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 20,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 12px 24px rgba(0,0,0,0.08)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 20,
                backgroundImage: 'none',
            },
            elevation1: {
                boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                borderBottom: '1px solid #e2e8f0',
                padding: '14px 16px',
            },
            head: {
                fontWeight: 600,
                backgroundColor: '#f8fafc',
                color: '#1e293b',
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    backgroundColor: '#f1f5f9',
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                fontWeight: 500,
            },
        },
    },
    MuiInputBase: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            },
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main,
                },
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 24,
            },
        },
    },
    MuiMenu: {
        styleOverrides: {
            paper: {
                borderRadius: 16,
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRight: '1px solid rgba(0,0,0,0.05)',
            },
        },
    },
};
// الثيم الفاتح (المضيء)
export const lightTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            disabled: '#94a3b8',
        },
        divider: '#e2e8f0',
    },
    typography: {
        fontFamily: '"Inter", "Cairo", "Segoe UI", "Poppins", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
        h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
        h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
        h5: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
        h6: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
        subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
        body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
        body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
        overline: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0,0,0,0.05)',
        '0px 1px 3px rgba(0,0,0,0.1)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 6px rgba(0,0,0,0.05)',
        '0px 6px 8px rgba(0,0,0,0.05)',
        '0px 8px 12px rgba(0,0,0,0.05)',
        '0px 10px 16px rgba(0,0,0,0.05)',
        '0px 12px 20px rgba(0,0,0,0.05)',
        '0px 14px 24px rgba(0,0,0,0.05)',
        '0px 16px 28px rgba(0,0,0,0.05)',
        '0px 18px 32px rgba(0,0,0,0.05)',
        '0px 20px 36px rgba(0,0,0,0.05)',
        ...Array(12).fill('none'),
    ],
    components: {
        ...sharedComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                },
            },
        },
    },
});
// الثيم الداكن (المظلم)
export const darkTheme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'dark',
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            disabled: '#64748b',
        },
        divider: '#334155',
    },
    typography: lightTheme.typography,
    shape: lightTheme.shape,
    shadows: lightTheme.shadows,
    components: {
        ...sharedComponents,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(30,41,59,0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e293b',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                },
                root: {
                    borderBottom: '1px solid #334155',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#334155',
                    },
                },
            },
        },
    },
});
