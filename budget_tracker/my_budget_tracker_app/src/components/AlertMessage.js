import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';
import '../styles/AlertMessage.css';

const AlertMessage = ({ message, severity }) => {
    return (
        <div className="alert-container">
            <Alert
                severity={severity}
                className={`custom-alert ${severity === 'success' ? 'success-alert' : ''}`}
            >
                <AlertTitle>{severity === 'error' ? 'Error' : 'Success'}</AlertTitle>
                {message}
            </Alert>
        </div>
    );
};

AlertMessage.propTypes = {
    message: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['error', 'success']).isRequired,
};

export default AlertMessage;
