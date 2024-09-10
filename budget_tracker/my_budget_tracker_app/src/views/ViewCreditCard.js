import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import EditCreditCardForm from '../components/EditCreditCardForm';

const ViewCreditCard = () => {
  const { logout } = useAuth();
  const [creditCards, setCreditCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [formData, setFormData] = useState({
    last_four_digits: '',
    brand: '',
    expire_date: '',
    credit_limit: '',
    payment_day: '',
    close_card_day: '',
  });
  const [editErrors, setEditErrors] = useState({}); // Track edit errors
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        const response = await axiosInstance.get('/api/credit_cards/');
        setCreditCards(response.data);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
      }
    };

    fetchCreditCards();
  }, []);

  const handleEditClick = (card) => {
    setEditingCardId(card.id);
    setFormData({
      last_four_digits: card.last_four_digits,
      brand: card.brand,
      expire_date: card.expire_date,
      credit_limit: card.credit_limit,
      payment_day: card.payment_day,
      close_card_day: card.close_card_day,
    });
    setEditErrors({}); // Clear previous errors
  };

  const handleCancelClick = () => {
    setEditingCardId(null);
    setFormData({
      last_four_digits: '',
      brand: '',
      expire_date: '',
      credit_limit: '',
      payment_day: '',
      close_card_day: '',
    });
    setEditErrors({});
  };

  const handleSaveClick = async () => {
    try {
      setEditErrors({}); // Clear previous errors
      const response = await axiosInstance.put(`/api/credit_cards/${editingCardId}/`, formData);
      if (response.status === 200) {
        setCreditCards((prevCards) =>
          prevCards.map((card) =>
            card.id === editingCardId ? { ...card, ...formData } : card
          )
        );
        setEditingCardId(null);
      } else {
        throw new Error('Failed to update credit card');
      }
    } catch (error) {
      console.error('Error updating credit card:', error);
      if (error.response && error.response.data) {
        // Capture field-specific errors
        const errorData = error.response.data;
        setEditErrors(errorData); // Display field-specific errors
      } else {
        setEditErrors({ general: 'An unexpected error occurred while updating the credit card.' });
      }
    }
  };

  const handleDeleteClick = (cardId) => {
    setCardToDelete(cardId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/credit_cards/${cardToDelete}/`);
      if (response.status === 204) {
        setCreditCards((prevCards) => prevCards.filter((card) => card.id !== cardToDelete));
        setOpenDeleteDialog(false);
        setCardToDelete(null);
        setDeleteError('');
      } else {
        throw new Error('Failed to delete credit card');
      }
    } catch (error) {
      console.error('Error deleting credit card:', error);
      setDeleteError('Failed to delete credit card. Please try again.');
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCardToDelete(null);
    setDeleteError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="view-credit-card">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>View Credit Cards</Typography>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell>Last Four Digits</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Expire Date</TableCell>
                <TableCell>Credit Limit</TableCell>
                <TableCell>Payment Day</TableCell>
                <TableCell>Close Card Day</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creditCards.map((card) => (
                <TableRow key={card.id}>
                  {editingCardId === card.id ? (
                    <EditCreditCardForm
                      formData={formData}
                      handleChange={handleChange}
                      handleSaveClick={handleSaveClick}
                      handleCancelClick={handleCancelClick}
                      editErrors={editErrors} // Pass errors to form
                    />
                  ) : (
                    <>
                      <TableCell>{card.last_four_digits}</TableCell>
                      <TableCell>{card.brand}</TableCell>
                      <TableCell>{card.expire_date}</TableCell>
                      <TableCell>{card.credit_limit}</TableCell>
                      <TableCell>{card.payment_day}</TableCell>
                      <TableCell>{card.close_card_day}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditClick(card)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(card.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Container>

        {/* Delete Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            <Typography>Are you sure you want to delete this credit card?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDelete} color="primary">
              Delete
            </Button>
            <Button onClick={handleCloseDeleteDialog} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewCreditCard;
