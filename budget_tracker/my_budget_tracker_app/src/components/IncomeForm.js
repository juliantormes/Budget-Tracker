import React from 'react';
import { TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import PropTypes from 'prop-types';

const IncomeForm = ({
  formData,
  categories,
  handleChange,
  handleSubmit,
  errors,
}) => (
  <form onSubmit={handleSubmit} className="form-container" autoComplete="off">
    <TextField
      select
      label="Category"
      name="category"
      value={formData.category}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      className="text-field"
      error={!!errors.category}
      helperText={errors.category || ''}
      autoComplete="off"
    >
      {categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      ))}
    </TextField>
    <TextField
      label="Date"
      name="date"
      type="date"
      value={formData.date}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      className="text-field"
      InputLabelProps={{
        shrink: true,
      }}
      error={!!errors.date}
      helperText={errors.date || ''}
      autoComplete="off"
    />
    <TextField
      label="Amount"
      name="amount"
      type="number"
      value={formData.amount}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      className="text-field"
      error={!!errors.amount}
      helperText={errors.amount || ''}
      autoComplete="off"
    />
    <TextField
      label="Description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      className="text-field"
      error={!!errors.description}
      helperText={errors.description || ''}
      autoComplete="off"
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={formData.is_recurring}
          onChange={handleChange}
          name="is_recurring"
          color="primary"
        />
      }
      label="Recurring Income"
    />
    <Button type="submit" variant="contained" color="primary" className="submit-button" data-testid="submit-income">
      Add Income
    </Button>
  </form>
);

IncomeForm.propTypes = {
  formData: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired, // Field-specific errors
};

export default IncomeForm;
