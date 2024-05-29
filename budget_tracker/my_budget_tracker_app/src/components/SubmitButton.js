import React from 'react';
import '../styles/FormStyles.css';

const SubmitButton = ({ onClick, text }) => {
    return (
        <button onClick={onClick} className="submit-button">
            {text}
        </button>
    );
};

export default SubmitButton;
