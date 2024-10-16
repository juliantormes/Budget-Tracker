import React from 'react';
import { TextField, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';

const EditCategoryForm = ({ formData, handleChange, handleSave, handleCancel }) => (
  <div className="category-item">
    <TextField
      name="name"
      value={formData.name}
      onChange={handleChange}
      fullWidth
      className="text-field"
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
};

export default EditCategoryForm;
