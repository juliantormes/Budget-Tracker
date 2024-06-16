import React from 'react';
import '../styles/FormStyles.css';

const SubmitButton = ({ text, onClick, type = "submit", className }) => (
    <button type={type} onClick={onClick} className={className}>
        {text}
    </button>
);

export default SubmitButton;
