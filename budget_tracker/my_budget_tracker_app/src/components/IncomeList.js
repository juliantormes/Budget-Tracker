import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axiosInstance from '../api/axiosApi';
import EditableRow from './EditableRow';
import '../styles/IncomeList.css';

const IncomeList = ({ incomes, refetch }) => {
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/income_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleEditClick = (income) => {
    setEditingIncomeId(income.id);
  };

  const handleCancelClick = () => {
    setEditingIncomeId(null);
  };

  const handleSaveClick = async (formData) => {
    try {
      const response = await axiosInstance.put(`/api/incomes/${formData.id}/`, formData);
      if (response.status === 200) {
        refetch();
        setEditingIncomeId(null);
      } else {
        throw new Error('Failed to update income');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (incomeId) => {
    try {
      const response = await axiosInstance.delete(`/api/incomes/${incomeId}/`);
      if (response.status === 204) {
        refetch();
      } else {
        throw new Error('Failed to delete income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Category</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {incomes.map((income) => (
          <EditableRow
            key={income.id}
            item={income}
            isEditing={editingIncomeId === income.id}
            onEdit={handleEditClick}
            onCancel={handleCancelClick}
            onSave={handleSaveClick}
            onDelete={handleDeleteClick}
            categories={categories}
            type="income"
            showType={false}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default IncomeList;
