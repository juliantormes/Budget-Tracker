import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/ViewCreditCard.css';

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
  };

  const handleSaveClick = async () => {
    try {
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
    }
  };

  const handleDeleteClick = async (cardId) => {
    try {
      const response = await axiosInstance.delete(`/api/credit_cards/${cardId}/`);
      if (response.status === 204) {
        setCreditCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      } else {
        throw new Error('Failed to delete credit card');
      }
    } catch (error) {
      console.error('Error deleting credit card:', error);
    }
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
              <TableRow>
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
                    <>
                      <TableCell>
                        <TextField
                          name="last_four_digits"
                          value={formData.last_four_digits}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="expire_date"
                          type="date"
                          value={formData.expire_date}
                          onChange={handleChange}
                          fullWidth
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
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="payment_day"
                          type="number"
                          value={formData.payment_day}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="close_card_day"
                          type="number"
                          value={formData.close_card_day}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={handleSaveClick}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancelClick}>
                          <CancelIcon />
                        </IconButton>
                      </TableCell>
                    </>
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
      </div>
    </div>
  );
};

export default ViewCreditCard;
