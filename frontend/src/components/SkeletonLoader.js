import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material';
export function DashboardSkeleton() {
    return (_jsxs(Box, { children: [_jsx(Skeleton, { variant: "text", width: 200, height: 40, sx: { mb: 3 } }), _jsx(Grid, { container: true, spacing: 3, children: [1, 2, 3, 4].map((i) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Skeleton, { variant: "text", width: 100 }), _jsx(Skeleton, { variant: "text", width: 80, height: 40 })] }) }) }, i))) })] }));
}
export function TableSkeleton() {
    return (_jsxs(Box, { children: [_jsx(Skeleton, { variant: "rectangular", height: 56, sx: { mb: 2 } }), [1, 2, 3, 4, 5].map((i) => (_jsx(Skeleton, { variant: "rectangular", height: 50, sx: { mb: 1 } }, i)))] }));
}
