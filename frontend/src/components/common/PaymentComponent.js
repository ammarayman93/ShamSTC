import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid, Button, Typography } from '@mui/material';
const PaymentComponent = () => {
    return (_jsx(Grid, { container: true, spacing: 2, justifyContent: "center", alignItems: "center", style: { minHeight: '100vh' }, children: _jsxs(Grid, { item: true, xs: 12, sm: 6, md: 4, children: [_jsx(Typography, { variant: "h4", align: "center", gutterBottom: true, children: "Pay for Subscription" }), _jsx(Button, { variant: "contained", color: "primary", fullWidth: true, children: "Pay Now" })] }) }));
};
export default PaymentComponent;
