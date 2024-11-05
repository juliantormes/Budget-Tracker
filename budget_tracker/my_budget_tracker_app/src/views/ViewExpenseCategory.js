import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  IconButton,
  Button,
  Alert,
} from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import EditCategoryForm from '../components/EditCategoryForm';
import DeleteDialog from '../components/DeleteDialog';
import '../styles/ViewExpenseCategory.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ViewExpenseCategory = () => {
  const { logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({}); // To handle field-specific errors
  const [generalError, setGeneralError] = useState(''); // General error for failed API calls
  const [successMessage, setSuccessMessage] = useState(''); // Success feedback for user actions
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const query = useQuery();
  const addMode = query.get('add');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('expense_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setGeneralError('Failed to load categories.');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (addMode) {
      setEditingCategoryId('new');
      setFormData({ name: '' });
    } else {
      setEditingCategoryId(null);
      setFormData({ name: '' });
    }
  }, [addMode]);

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    setFormData({ name: category.name });
  };

  const handleCancelClick = () => {
    setEditingCategoryId(null);
    setFormData({ name: '' });
    setErrors({});
  };

  const handleSaveClick = async (categoryId) => {
    try {
      setErrors({}); // Clear previous errors
      setGeneralError('');
      setSuccessMessage('');
      const response = await axiosInstance.put(`expense_categories/${categoryId}/`, formData);
      if (response.status === 200) {
        const updatedCategories = categories.map((cat) =>
          cat.id === categoryId ? { ...cat, name: formData.name } : cat
        );
        setCategories(updatedCategories);
        setSuccessMessage('Category updated successfully!');
        setEditingCategoryId(null);
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Capture field-specific errors
      } else {
        setGeneralError('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setGeneralError('');
      const response = await axiosInstance.delete(`expense_categories/${categoryToDelete}/`);
      if (response.status === 204) {
        setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
        setOpenDeleteDialog(false);
        setCategoryToDelete(null);
        setSuccessMessage('Category deleted successfully!');
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setGeneralError('Failed to delete category. Please try again.');
      setOpenDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const handleNewCategorySave = async () => {
    try {
      setErrors({});
      setGeneralError('');
      const response = await axiosInstance.post('expense_categories/', formData);
      if (response.status === 201) {
        setCategories([...categories, response.data]);
        setSuccessMessage('Category added successfully!');
        setEditingCategoryId(null);
        setFormData({ name: '' });
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Capture field-specific errors
      } else {
        setGeneralError('Failed to add category. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="view-expense-category">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container maxWidth="sm" className="container-top">
          <Typography variant="h4" gutterBottom>View Expense Categories</Typography>

          {generalError && <Alert severity="error">{generalError}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <div className="category-list">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                {editingCategoryId === category.id ? (
                  <EditCategoryForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSave={() => handleSaveClick(category.id)}
                    handleCancel={handleCancelClick}
                    errors={errors} // Pass errors down to the form
                  />
                ) : (
                  <>
                    <span>{category.name}</span>
                    <div className="actions">
                      <IconButton onClick={() => handleEditClick(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(category.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </>
                )}
              </div>
            ))}
            {editingCategoryId === 'new' && (
              <EditCategoryForm
                formData={formData}
                handleChange={handleChange}
                handleSave={handleNewCategorySave}
                handleCancel={handleCancelClick}
                errors={errors} // Pass errors down to the form
              />
            )}
          </div>

          <div className="add-button-container">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditingCategoryId('new')}
              className="add-button"
            >
              Add Expense Category
            </Button>
          </div>
        </Container>

        <DeleteDialog
          open={openDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          handleConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default ViewExpenseCategory;
