import React from 'react';
import { TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import PropTypes from 'prop-types';

const ExpenseForm = ({
  formData,
  categories,
  creditCards,
  handleChange,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit} className="form-container">
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
    />
    <TextField
      label="Description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      className="text-field"
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
        />
      </>
    )}
    <Button type="submit" variant="contained" color="primary" className="submit-button">
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
};

export default ExpenseForm;
