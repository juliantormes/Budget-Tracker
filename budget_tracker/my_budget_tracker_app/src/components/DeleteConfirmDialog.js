import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';


const DeleteConfirmDialog = ({ open, onClose, onConfirm, incomeId }) => {
  return (
    <Dialog open={open} onClose={onClose} className="delete-dialog">
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this income?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={() => {
          console.log('Delete button clicked, incomeId:', incomeId);
          onConfirm(incomeId);
        }} color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
