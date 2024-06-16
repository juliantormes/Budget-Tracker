import React from 'react';
import PropTypes from 'prop-types';
import '../styles/FormStyles.css';

const FormContainer = ({ children }) => (
  <div className="form-container">
    {children}
  </div>
);

FormContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FormContainer;
