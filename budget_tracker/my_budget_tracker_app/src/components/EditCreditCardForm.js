import React from 'react';
import { TextField, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';

const EditCreditCardForm = ({ formData, handleChange, handleSaveClick, handleCancelClick }) => (
  <>
    <TableCell>
      <TextField
        name="last_four_digits"
        value={formData.last_four_digits}
        onChange={handleChange}
        fullWidth
        className="text-field"
      />
    </TableCell>
    <TableCell>
      <TextField
        name="brand"
        value={formData.brand}
        onChange={handleChange}
        fullWidth
        className="text-field"
      />
    </TableCell>
    <TableCell>
      <TextField
        name="expire_date"
        type="date"
        value={formData.expire_date}
        onChange={handleChange}
        fullWidth
        className="text-field"
        InputLabelProps={{
          shrink: true,
        }}
      />
    </TableCell>
    <TableCell>
      <TextField
        name="credit_limit"
        type="number"
        value={formData.credit_limit}
        onChange={handleChange}
        fullWidth
        className="text-field"
      />
    </TableCell>
    <TableCell>
      <TextField
        name="payment_day"
        type="number"
        value={formData.payment_day}
        onChange={handleChange}
        fullWidth
        className="text-field"
      />
    </TableCell>
    <TableCell>
      <TextField
        name="close_card_day"
        type="number"
        value={formData.close_card_day}
        onChange={handleChange}
        fullWidth
        className="text-field"
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
};

export default EditCreditCardForm;
