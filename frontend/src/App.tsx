import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { globalStyles } from './theme/globalStyles';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { ThemeContext } from './context/ThemeContext';

// Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientForm = lazy(() => import('./pages/ClientForm'));
const Users = lazy(() => import('./pages/Users'));
const Financial = lazy(() => import('./pages/Financial'));
const Plans = lazy(() => import('./pages/Plans'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Purchases = lazy(() => import('./pages/Purchases'));
const Sales = lazy(() => import('./pages/Sales'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Tickets = lazy(() => import('./pages/Tickets'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const MikroTikDevices = lazy(() => import('./pages/MikroTikDevices'));
const Accounts = lazy(() => import('./pages/Accounts'));
const CashBoxes = lazy(() => import('./pages/CashBoxes'));
const Materials = lazy(() => import('./pages/Materials'));
const PurchaseInvoices = lazy(() => import('./pages/PurchaseInvoices'));
const SalesInvoices = lazy(() => import('./pages/SalesInvoices'));
const CashFlow = lazy(() => import('./pages/CashFlow'));
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    </div>
);

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={globalStyles(theme)} />
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />

                            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
                                <Route path="clients" element={<Suspense fallback={<LoadingFallback />}><Clients /></Suspense>} />
                                <Route path="clients/new" element={<Suspense fallback={<LoadingFallback />}><ClientForm /></Suspense>} />
                                <Route path="clients/edit/:id" element={<Suspense fallback={<LoadingFallback />}><ClientForm /></Suspense>} />
                                <Route path="users" element={<Suspense fallback={<LoadingFallback />}><Users /></Suspense>} />
                                <Route path="financial" element={<Suspense fallback={<LoadingFallback />}><Financial /></Suspense>} />
                                <Route path="plans" element={<Suspense fallback={<LoadingFallback />}><Plans /></Suspense>} />
                                <Route path="inventory" element={<Suspense fallback={<LoadingFallback />}><Inventory /></Suspense>} />
                                <Route path="purchases" element={<Suspense fallback={<LoadingFallback />}><Purchases /></Suspense>} />
                                <Route path="sales" element={<Suspense fallback={<LoadingFallback />}><Sales /></Suspense>} />
                                <Route path="invoices" element={<Suspense fallback={<LoadingFallback />}><Invoices /></Suspense>} />
                                <Route path="tickets" element={<Suspense fallback={<LoadingFallback />}><Tickets /></Suspense>} />
                                <Route path="client-portal" element={<Suspense fallback={<LoadingFallback />}><ClientPortal /></Suspense>} />
                                <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><Reports /></Suspense>} />
                                <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />
                                <Route path="mikrotik-devices" element={<Suspense fallback={<LoadingFallback />}><MikroTikDevices /></Suspense>} />
                                <Route path="accounts" element={<Suspense fallback={<LoadingFallback />}><Accounts /></Suspense>} />
                                <Route path="cash-boxes" element={<Suspense fallback={<LoadingFallback />}><CashBoxes /></Suspense>} />
                                <Route path="materials" element={<Suspense fallback={<LoadingFallback />}><Materials /></Suspense>} />
                                <Route path="purchase-invoices" element={<Suspense fallback={<LoadingFallback />}><PurchaseInvoices /></Suspense>} />
                                <Route path="sales-invoices" element={<Suspense fallback={<LoadingFallback />}><SalesInvoices /></Suspense>} />
                                <Route path="cash-flow" element={<Suspense fallback={<LoadingFallback />}><CashFlow /></Suspense>} />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export default App;