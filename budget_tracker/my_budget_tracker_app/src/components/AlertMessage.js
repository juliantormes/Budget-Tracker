import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';

const AlertMessage = ({ message, severity, duration }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message) return null;

  return (
    <Collapse in={visible}>
      <Alert severity={severity} onClose={() => setVisible(false)}>
        <AlertTitle>{severity === 'error' ? 'Error' : 'Success'}</AlertTitle>
        {message}
      </Alert>
    </Collapse>
  );
};

AlertMessage.defaultProps = {
  duration: 3000, // Default duration: 3 seconds
};

export default AlertMessage;
