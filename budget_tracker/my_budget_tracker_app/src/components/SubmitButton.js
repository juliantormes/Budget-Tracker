import React from 'react';

const SubmitButton = ({ text, onClick, type = "submit" }) => (
    <button type={type} onClick={onClick} className={type === "button" ? "redirect-button" : "form-button"}>
        {text}
    </button>
);

export default SubmitButton;
