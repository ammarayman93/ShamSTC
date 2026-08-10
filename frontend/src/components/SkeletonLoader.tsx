import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material';

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={80} height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function TableSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}