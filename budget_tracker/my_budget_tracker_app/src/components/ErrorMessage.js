import React from 'react';
import '../styles/FormStyles.css';

const ErrorMessage = ({ error }) => {
    return error ? <div className="error-message">{error}</div> : null;
};

export default ErrorMessage;
