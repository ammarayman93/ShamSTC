// src/components/common/PaymentComponent.tsx
import React from 'react';
import { Grid, Button, Typography } from '@mui/material';

const PaymentComponent = () => {
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="h4" align="center" gutterBottom>
          Pay for Subscription
        </Typography>
        <Button variant="contained" color="primary" fullWidth>
          Pay Now
        </Button>
      </Grid>
    </Grid>
  );
}

export default PaymentComponent;