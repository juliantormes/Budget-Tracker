import React from 'react';
import PropTypes from 'prop-types';
import '../styles/AuthFormStyles.css';

const AuthFormContainer = ({ children }) => (
  <div className="auth-form-container">
    {children}
  </div>
);

AuthFormContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthFormContainer;
