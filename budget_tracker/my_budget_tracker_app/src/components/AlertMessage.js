import React from 'react';
import { Alert } from '@mui/material';
import PropTypes from 'prop-types';

const AlertMessage = ({ message, severity }) => {
  if (!message) return null;
  return <Alert severity={severity}>{message}</Alert>;
};

AlertMessage.propTypes = {
  message: PropTypes.string,
  severity: PropTypes.string.isRequired,
};

export default AlertMessage;
