import React from 'react';
import { TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import PropTypes from 'prop-types';

const ExpenseForm = ({
  formData,
  categories,
  creditCards,
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
      label="Recurring Expense"
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={formData.pay_with_credit_card}
          onChange={handleChange}
          name="pay_with_credit_card"
          color="primary"
        />
      }
      label="Paid with Credit Card"
    />
    {formData.pay_with_credit_card && (
      <>
        <TextField
          select
          label="Credit Card"
          name="credit_card_id"
          value={formData.credit_card_id}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          className="text-field"
          error={!!errors.credit_card_id}
          helperText={errors.credit_card_id || ''}
          autoComplete="off"
        >
          {creditCards.map((card) => (
            <MenuItem key={card.id} value={card.id}>
              {`${card.brand} ${card.last_four_digits}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Installments"
          name="installments"
          type="number"
          value={formData.installments}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          className="text-field"
          error={!!errors.installments}
          helperText={errors.installments || ''}
          autoComplete="off"
        />
        <TextField
          label="Surcharge (%)"
          name="surcharge"
          type="number"
          value={formData.surcharge}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          className="text-field"
          error={!!errors.surcharge}
          helperText={errors.surcharge || ''}
          autoComplete="off"
        />
      </>
    )}
    <Button
      type="submit"
      variant="contained"
      color="primary"
      className="submit-button"
      data-testid="submit-expense"
    >
      Add Expense
    </Button>
  </form>
);

ExpenseForm.propTypes = {
  formData: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  creditCards: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

export default ExpenseForm;
