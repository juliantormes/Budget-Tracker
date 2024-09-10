import React from 'react';
import { TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';

const CreditCardForm = ({ formData, handleChange, handleSubmit, errors }) => (
  <form onSubmit={handleSubmit} className="form-container" autoComplete="off">
    <TextField
      label="Last Four Digits"
      name="last_four_digits"
      value={formData.last_four_digits}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      error={!!errors.last_four_digits}
      helperText={errors.last_four_digits || ''}
    />
    <TextField
      label="Brand"
      name="brand"
      value={formData.brand}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      error={!!errors.brand}
      helperText={errors.brand || ''}
    />
    <TextField
      label="Expiration Date"
      name="expire_date"
      type="date"
      value={formData.expire_date}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      error={!!errors.expire_date}
      helperText={errors.expire_date || ''}
    />
    <TextField
      label="Credit Limit"
      name="credit_limit"
      type="number"
      value={formData.credit_limit}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      error={!!errors.credit_limit}
      helperText={errors.credit_limit || ''}
    />
    <TextField
      label="Payment Day"
      name="payment_day"
      type="number"
      value={formData.payment_day}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      error={!!errors.payment_day}
      helperText={errors.payment_day || ''}
    />
    <TextField
      label="Close Card Day"
      name="close_card_day"
      type="number"
      value={formData.close_card_day}
      onChange={handleChange}
      required
      fullWidth
      variant="outlined"
      error={!!errors.close_card_day}
      helperText={errors.close_card_day || ''}
    />
    <Button type="submit" variant="contained" color="primary" className="submit-button">
      Add Credit Card
    </Button>
  </form>
);

CreditCardForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default CreditCardForm;
