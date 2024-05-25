import React from 'react';
import ReactDOM from 'react-dom/client';
import './setup/chartSetup'; // Import the setup file for Chart.js
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
//"Change the strictmode if you having problems debugging the app."