import React from 'react';
import { TextField, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import AlertMessage from '../components/AlertMessage'; // Assuming this component exists

const EditCreditCardForm = ({
  formData,
  handleChange,
  handleSaveClick,
  handleCancelClick,
  editErrors,
  successMessage,
}) => (
  <>
    {/* Display success message if present */}
    {successMessage && (
      <TableCell colSpan={7}>
        <AlertMessage message={successMessage} severity="success" />
      </TableCell>
    )}

    {/* Display general error message if present */}
    {editErrors.general && (
      <TableCell colSpan={7}>
        <AlertMessage message={editErrors.general} severity="error" />
      </TableCell>
    )}

    <TableCell>
      <TextField
        name="last_four_digits"
        label="Last Four Digits"
        value={formData.last_four_digits}
        onChange={handleChange}
        fullWidth
        className="text-field"
        data-testid="credit-card-last-four-digits"
        error={!!editErrors.last_four_digits}
        helperText={editErrors.last_four_digits || ""}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="brand"
        label="Brand"
        value={formData.brand}
        onChange={handleChange}
        fullWidth
        className="text-field"
        data-testid="credit-card-brand"
        error={!!editErrors.brand}
        helperText={editErrors.brand || ""}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="expire_date"
        label="Expire Date"
        type="date"
        value={formData.expire_date}
        onChange={handleChange}
        fullWidth
        className="text-field"
        InputLabelProps={{ shrink: true }}
        data-testid="credit-card-expire-date"
        error={!!editErrors.expire_date}
        helperText={editErrors.expire_date || ""}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="credit_limit"
        label="Credit Limit"
        type="number"
        value={formData.credit_limit}
        onChange={handleChange}
        fullWidth
        className="text-field"
        data-testid="credit-card-limit"
        error={!!editErrors.credit_limit}
        helperText={editErrors.credit_limit || ""}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="payment_day"
        label="Payment Day"
        type="number"
        value={formData.payment_day}
        onChange={handleChange}
        fullWidth
        className="text-field"
        data-testid="credit-card-payment-day"
        error={!!editErrors.payment_day}
        helperText={editErrors.payment_day || ""}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="close_card_day"
        label="Close Card Day"
        type="number"
        value={formData.close_card_day}
        onChange={handleChange}
        fullWidth
        className="text-field"
        data-testid="credit-card-close-day"
        error={!!editErrors.close_card_day}
        helperText={editErrors.close_card_day || ""}
      />
    </TableCell>
    <TableCell>
      <IconButton aria-label="Save" onClick={handleSaveClick}>
        <SaveIcon />
      </IconButton>
      <IconButton aria-label="Cancel" onClick={handleCancelClick}>
        <CancelIcon />
      </IconButton>
    </TableCell>
  </>
);

EditCreditCardForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSaveClick: PropTypes.func.isRequired,
  handleCancelClick: PropTypes.func.isRequired,
  editErrors: PropTypes.object.isRequired, // Prop for error messages
  successMessage: PropTypes.string, // Prop for success message
};

export default EditCreditCardForm;
