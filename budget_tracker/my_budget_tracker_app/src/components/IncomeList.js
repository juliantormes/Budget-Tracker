import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';

const IncomeList = ({ incomes, handleEdit, handleDelete }) => (
  <List>
    {incomes.map(income => (
      <ListItem key={income.id} className="income-list-item">
        <ListItemText primary={income.category_name} secondary={dayjs(income.date).format('MMMM D, YYYY')} />
        <ListItemText primary={`$${Number(income.amount).toFixed(2)}`} />
        <IconButton onClick={() => handleEdit(income.id)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => handleDelete(income.id)}>
          <Delete />
        </IconButton>
      </ListItem>
    ))}
  </List>
);

export default IncomeList;
