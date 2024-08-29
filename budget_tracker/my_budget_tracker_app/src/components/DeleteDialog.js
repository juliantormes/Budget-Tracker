// DeleteDialog.js
import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import PropTypes from 'prop-types';

const DeleteDialog = ({ open, handleClose, handleConfirm }) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="delete-dialog-title"
    aria-describedby="delete-dialog-description"
  >
    <DialogTitle id="delete-dialog-title" className="dialog-title">Confirm Delete</DialogTitle>
    <DialogContent>
      <DialogContentText id="delete-dialog-description" className="dialog-content-text">
        Are you sure you want to delete this category?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
    <Button onClick={handleConfirm} className="button">
        Confirm
      </Button>
      <Button onClick={handleClose} className="button">
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
};

export default DeleteDialog;
