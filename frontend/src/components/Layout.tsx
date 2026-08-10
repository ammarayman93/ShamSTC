import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Tooltip,
    Divider,
    useTheme,
    alpha,
    Stack,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    TrendingUp as TrendingUpIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Inventory as InventoryIcon,
    ShoppingCart as ShoppingCartIcon,
    LocalMall as LocalMallIcon,
    Description as DescriptionIcon,
    Help as HelpIcon,
    AccountCircle as AccountCircleIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    AccountTree as AccountTreeIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    AccountBalance as AccountBalanceIcon,
    Storefront as StorefrontIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';

const drawerWidth = 280;

const menuItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: <DashboardIcon /> },
    { path: '/clients', label: 'العملاء', icon: <PeopleIcon /> },
    { path: '/users', label: 'المستخدمين', icon: <PeopleIcon /> },
    { path: '/financial', label: 'المالية', icon: <MoneyIcon /> },
    { path: '/accounts', label: 'شجرة الحسابات', icon: <AccountTreeIcon /> },
    { path: '/cash-boxes', label: 'الصناديق', icon: <AccountBalanceWalletIcon /> },
    { path: '/cash-flow', label: 'حركة الصناديق', icon: <AccountBalanceIcon /> },
    { path: '/materials', label: 'بطاقة المادة', icon: <CategoryIcon /> },
    { path: '/purchase-invoices', label: 'فواتير المشتريات', icon: <ShoppingCartIcon /> },
    { path: '/sales-invoices', label: 'فواتير المبيعات', icon: <StorefrontIcon /> },
    { path: '/plans', label: 'الباقات', icon: <ReceiptIcon /> },
    { path: '/inventory', label: 'المخزون', icon: <InventoryIcon /> },
    { path: '/purchases', label: 'المشتريات', icon: <ShoppingCartIcon /> },
    { path: '/sales', label: 'المبيعات', icon: <LocalMallIcon /> },
    { path: '/invoices', label: 'الفواتير', icon: <DescriptionIcon /> },
    { path: '/tickets', label: 'تذاكر الدعم', icon: <HelpIcon /> },
    { path: '/client-portal', label: 'بوابة العميل', icon: <AccountCircleIcon /> },
    { path: '/reports', label: 'التقارير', icon: <TrendingUpIcon /> },
    { path: '/settings', label: 'الإعدادات', icon: <SettingsIcon /> },
    { path: '/mikrotik-devices', label: 'أجهزة MikroTik', icon: <SettingsIcon /> },
];

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useAppTheme();
    const theme = useTheme();
    const navigate = useNavigate();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <Toolbar sx={{ justifyContent: 'center', py: 3 }}>
                <Typography
                    variant="h5"
                    fontWeight="800"
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    شركة شام STC
        </Typography>
            </Toolbar>
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 3,
                                py: 1,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h3"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        شركة شام S T C
          </Typography>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title={isDarkMode ? 'الوضع الفاتح' : 'الوضع المظلم'}>
                            <IconButton onClick={toggleTheme}>
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="الإشعارات">
                            <IconButton onClick={handleNotifOpen}>
                                <Badge badgeContent={3} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="الحساب">
                            <IconButton onClick={handleMenuOpen}>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 35, height: 35 }}>
                                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 3 } }}
            >
                <MenuItem>
                    <Box>
                        <Typography fontWeight="bold">{user?.fullName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                            {user?.role}
                        </Typography>
                    </Box>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        navigate('/settings');
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
          الإعدادات
        </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
            </Menu>

            <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={handleNotifClose}
                PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 3 } }}
            >
                <Box p={2} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6">الإشعارات</Typography>
                </Box>
                <MenuItem onClick={handleNotifClose}>
                    <Box>
                        <Typography variant="body2" fontWeight="bold">
                            مرحباً بك
            </Typography>
                        <Typography variant="caption" color="textSecondary">
                            تم تسجيل الدخول بنجاح
            </Typography>
                    </Box>
                </MenuItem>
                <Divider />
                <Box p={2} textAlign="center">
                    <Typography variant="caption" color="textSecondary">
                        لا توجد إشعارات جديدة
          </Typography>
                </Box>
            </Menu>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            bgcolor: 'transparent',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    bgcolor: theme.palette.background.default,
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
