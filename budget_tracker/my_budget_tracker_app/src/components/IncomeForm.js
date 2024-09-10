import React from 'react';
import { TextField, Button, Grid, MenuItem, FormControlLabel, Checkbox } from '@mui/material';

const IncomeForm = ({ formData, categories, handleChange, handleSubmit, errors }) => {
  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Category"
            name="category"
            select
            value={formData.category}
            onChange={handleChange}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
            autoComplete="off"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_recurring}
                onChange={handleChange}
                name="is_recurring"
                autoComplete="off"
              />
            }
            label="Is Recurring"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Income
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default IncomeForm;
