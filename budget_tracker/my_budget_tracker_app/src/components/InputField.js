import React from 'react';
import '../styles/FormStyles.css';

const InputField = ({ type, value, onChange, placeholder }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="input-field"
        />
    );
};

export default InputField;
