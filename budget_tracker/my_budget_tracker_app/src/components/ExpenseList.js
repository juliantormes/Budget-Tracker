import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axiosInstance from '../api/axiosApi';
import EditableRow from './EditableRow';

const ExpenseList = ({ expenses, refetch }) => {
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/expense_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense.id);
  };

  const handleCancelClick = () => {
    setEditingExpenseId(null);
  };

  const handleSaveClick = async (formData) => {
    try {
      const response = await axiosInstance.put(`/api/expenses/${formData.id}/`, formData);
      if (response.status === 200) {
        refetch();
        setEditingExpenseId(null);
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (expenseId) => {
    try {
      const response = await axiosInstance.delete(`/api/expenses/${expenseId}/`);
      if (response.status === 204) {
        refetch();
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Category</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {expenses.map((expense) => (
          <EditableRow
            key={expense.id}
            item={expense}
            isEditing={editingExpenseId === expense.id}
            onEdit={handleEditClick}
            onCancel={handleCancelClick}
            onSave={handleSaveClick}
            onDelete={handleDeleteClick}
            categories={categories}
            type="expense"
            showType={true}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseList;
