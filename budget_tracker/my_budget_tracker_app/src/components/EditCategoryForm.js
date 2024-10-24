import React from 'react';
import { TextField, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';

const EditCategoryForm = ({ formData, handleChange, handleSave, handleCancel, errors }) => (
  <div className="category-item">
    <TextField
      label="Category Name"
      name="name"
      value={formData.name}
      onChange={handleChange}
      fullWidth
      className="text-field"
      error={!!errors.name} // If errors.name exists, show error state
      helperText={errors.name ? errors.name[0] : ''} // Display the first error message for 'name'
    />
    <div className="actions">
      <IconButton data-testid="save-button" onClick={handleSave}>
        <SaveIcon />
      </IconButton>
      <IconButton data-testid="cancel-button" onClick={handleCancel}>
        <CancelIcon />
      </IconButton>
    </div>
  </div>
);

EditCategoryForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  errors: PropTypes.object, // Ensure errors is passed to the form
};

export default EditCategoryForm;
