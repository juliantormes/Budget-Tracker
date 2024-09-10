import React from 'react';
import { TextField, Button, Grid } from '@mui/material';

const CreditCardForm = ({ formData, handleChange, handleSubmit, errors }) => {
  return (
    <form onSubmit={handleSubmit} autoComplete="off"> {/* Add autoComplete="off" here */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Last Four Digits"
            name="last_four_digits"
            value={formData.last_four_digits}
            onChange={handleChange}
            error={!!errors.last_four_digits}
            helperText={errors.last_four_digits}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            error={!!errors.brand}
            helperText={errors.brand}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Expiration Date"
            name="expire_date"
            type="date"
            value={formData.expire_date}
            onChange={handleChange}
            error={!!errors.expire_date}
            helperText={errors.expire_date}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Credit Limit"
            name="credit_limit"
            type="number"
            value={formData.credit_limit}
            onChange={handleChange}
            error={!!errors.credit_limit}
            helperText={errors.credit_limit}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Payment Day"
            name="payment_day"
            type="number"
            value={formData.payment_day}
            onChange={handleChange}
            error={!!errors.payment_day}
            helperText={errors.payment_day}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Card Close Day"
            name="close_card_day"
            type="number"
            value={formData.close_card_day}
            onChange={handleChange}
            error={!!errors.close_card_day}
            helperText={errors.close_card_day}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Credit Card
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreditCardForm;
