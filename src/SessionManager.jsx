// src/SessionManager.jsx

import React from 'react';
import useIdleLogout from './useIdleLogout';

const SessionManager = ({ children }) => {
  useIdleLogout(); // Uses default 5 minutes; adjust as needed: useIdleLogout(10 * 60 * 1000) for 10 min
  return children;
};

export default SessionManager;
